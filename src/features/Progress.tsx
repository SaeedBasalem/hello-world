import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'
import { TrendingUp, Trophy, NotebookPen, Wind, Loader2, Check, BarChart3 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import type { JournalEntry, RoutineDay, SwapEvent, WeeklyReview } from '../lib/types'
import { lastNDays, prettyDate, weekStart } from '../lib/dates'
import { Card, SectionTitle, Spinner, ProgressRing } from '../components/ui'

export default function Progress() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [loading, setLoading] = useState(true)
  const [journal, setJournal] = useState<JournalEntry[]>([])
  const [swaps, setSwaps] = useState<SwapEvent[]>([])
  const [routines, setRoutines] = useState<RoutineDay[]>([])
  const [breathCount, setBreathCount] = useState(0)
  const [ladderCount, setLadderCount] = useState(0)
  const [reviews, setReviews] = useState<WeeklyReview[]>([])

  const load = async () => {
    if (!user) return
    const since30 = lastNDays(30)[0]
    const since14 = lastNDays(14)[0]
    const [j, s, r, b, l, w] = await Promise.all([
      supabase.from('sc_journal_entries').select('*').eq('user_id', user.id).gte('day', since30).order('day'),
      supabase.from('sc_swap_events').select('*').eq('user_id', user.id).gte('day', since14),
      supabase.from('sc_routine_days').select('*').eq('user_id', user.id).gte('day', since14),
      supabase.from('sc_breathing_sessions').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('sc_ladder_attempts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('sc_weekly_reviews').select('*').eq('user_id', user.id).order('week_start', { ascending: false }),
    ])
    setJournal((j.data as JournalEntry[]) ?? [])
    setSwaps((s.data as SwapEvent[]) ?? [])
    setRoutines((r.data as RoutineDay[]) ?? [])
    setBreathCount(b.count ?? 0)
    setLadderCount(l.count ?? 0)
    setReviews((w.data as WeeklyReview[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const anxietyData = useMemo(() => {
    const byDay = new Map(journal.filter((e) => e.anxiety_rating != null).map((e) => [e.day, e.anxiety_rating]))
    return lastNDays(30).map((d) => ({ date: prettyDate(d), anxiety: byDay.get(d) ?? null }))
  }, [journal])

  const swapData = useMemo(() => {
    const days = lastNDays(14)
    const wins = new Map<string, number>()
    const sw = new Map<string, number>()
    swaps.forEach((e) => {
      const m = e.said_anyway ? wins : sw
      m.set(e.day, (m.get(e.day) ?? 0) + 1)
    })
    return days.map((d) => ({ date: prettyDate(d), 'said anyway': wins.get(d) ?? 0, swapped: sw.get(d) ?? 0 }))
  }, [swaps])

  const routineData = useMemo(() => {
    const byDay = new Map(
      routines.map((r) => [
        r.day,
        [r.morning_prime, r.easy_reading, r.voluntary_stutter, r.real_rep, r.evening_reflect].filter(Boolean).length,
      ]),
    )
    return lastNDays(14).map((d) => ({ date: prettyDate(d), tasks: byDay.get(d) ?? 0 }))
  }, [routines])

  const totalWins = swaps.filter((e) => e.said_anyway).length
  const hasAnxiety = anxietyData.some((d) => d.anxiety != null)

  if (loading) return <Spinner label="Crunching your trends…" />

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          title="Your trends"
          subtitle="You’re watching the direction of the line over weeks — never the height of a single point. Falling anxiety and rising routine days are the real win."
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<TrendingUp className="h-5 w-5" />} value={`L${profile?.current_level ?? 1}`} label="Ladder level" />
          <Stat icon={<Trophy className="h-5 w-5" />} value={totalWins} label="“Said anyway” wins (14d)" />
          <Stat icon={<NotebookPen className="h-5 w-5" />} value={journal.length} label="Reflections (30d)" />
          <Stat icon={<Wind className="h-5 w-5" />} value={breathCount} label="Breathing sessions" />
        </div>
      </Card>

      <Card>
        <SectionTitle title="Anxiety while speaking" subtitle="From your daily reflections. Lower is better — and bumps are normal." />
        {hasAnxiety ? (
          <ChartFrame>
            <LineChart data={anxietyData} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f2" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" minTickGap={24} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Line type="monotone" dataKey="anxiety" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} connectNulls />
            </LineChart>
          </ChartFrame>
        ) : (
          <Hint>Add an anxiety rating to a daily reflection and your trend line will appear here.</Hint>
        )}
      </Card>

      <Card>
        <SectionTitle title="The word-swap lever" subtitle="Wins (said anyway) climbing and swaps falling is exactly the shape we want." />
        {swaps.length > 0 ? (
          <ChartFrame>
            <BarChart data={swapData} margin={{ left: -20, right: 8, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef2f2" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" minTickGap={20} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="said anyway" stackId="a" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="swapped" stackId="a" fill="#cbd5e1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartFrame>
        ) : (
          <Hint>Log a few moments on the Word-swap lever page to see your ratio shift over time.</Hint>
        )}
      </Card>

      <Card>
        <SectionTitle title="Routine days" subtitle="Tasks completed each day (out of 5). Showing up is the self-trust exercise." />
        <ChartFrame>
          <BarChart data={routineData} margin={{ left: -20, right: 8, top: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f2" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} interval="preserveStartEnd" minTickGap={20} />
            <YAxis domain={[0, 5]} allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip />
            <Bar dataKey="tasks" fill="#14b8a6" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ChartFrame>
      </Card>

      <WeeklyReviewCard
        swaps={swaps}
        routines={routines}
        reviews={reviews}
        ladderCount={ladderCount}
        onSaved={load}
      />
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: React.ReactNode; label: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <div className="mx-auto mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
        {icon}
      </div>
      <div className="text-xl font-extrabold text-ink">{value}</div>
      <div className="text-[11px] leading-tight text-ink-faint">{label}</div>
    </div>
  )
}

function ChartFrame({ children }: { children: React.ReactElement }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  )
}

function Hint({ children }: { children: React.ReactNode }) {
  return <p className="rounded-xl bg-slate-50 px-4 py-6 text-center text-sm text-ink-faint">{children}</p>
}

// ---- Weekly review ----

const REVIEW_METRICS: { key: keyof WeeklyReview; label: string; better: 'high' | 'low' }[] = [
  { key: 'confidence', label: 'Confidence', better: 'high' },
  { key: 'anxiety', label: 'Anxiety while speaking', better: 'low' },
  { key: 'ease', label: 'Ease / flow of speech', better: 'high' },
  { key: 'comfort', label: 'Comfort presenting', better: 'high' },
]

function WeeklyReviewCard({
  swaps,
  routines,
  reviews,
  ladderCount,
  onSaved,
}: {
  swaps: SwapEvent[]
  routines: RoutineDay[]
  reviews: WeeklyReview[]
  ladderCount: number
  onSaved: () => void
}) {
  const { user } = useAuth()
  const ws = weekStart()
  const existing = reviews.find((r) => r.week_start === ws)

  const suggestedSwaps = swaps.filter((e) => e.day >= ws && !e.said_anyway).length
  const suggestedRoutineDays = routines.filter(
    (r) => r.day >= ws && [r.morning_prime, r.easy_reading, r.voluntary_stutter, r.real_rep, r.evening_reflect].filter(Boolean).length > 0,
  ).length

  const [form, setForm] = useState<Partial<WeeklyReview>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(
      existing ?? {
        confidence: null,
        anxiety: null,
        ease: null,
        comfort: null,
        swap_count: suggestedSwaps,
        routine_days: suggestedRoutineDays,
        best_moment: '',
        hardest_moment: '',
        learned: '',
        adjust: '',
      },
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existing?.id])

  const setNum = (key: keyof WeeklyReview, v: number) => setForm({ ...form, [key]: v })

  const save = async () => {
    if (!user) return
    setSaving(true)
    await supabase.from('sc_weekly_reviews').upsert(
      {
        user_id: user.id,
        week_start: ws,
        confidence: form.confidence ?? null,
        anxiety: form.anxiety ?? null,
        ease: form.ease ?? null,
        comfort: form.comfort ?? null,
        swap_count: form.swap_count ?? null,
        routine_days: form.routine_days ?? null,
        best_moment: (form.best_moment as string)?.trim() || null,
        hardest_moment: (form.hardest_moment as string)?.trim() || null,
        learned: (form.learned as string)?.trim() || null,
        adjust: (form.adjust as string)?.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,week_start' },
    )
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    onSaved()
  }

  return (
    <Card>
      <SectionTitle
        title="Weekly review"
        subtitle={`Week of ${prettyDate(ws)} · five minutes. You're watching the trend over 3–4 weeks, not judging one week.`}
        icon={<ProgressRing value={Math.min(1, ladderCount / 12)} size={40} stroke={5} />}
      />

      <div className="space-y-4">
        {REVIEW_METRICS.map((m) => (
          <div key={m.key}>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-ink-soft">{m.label}</span>
              <span className="text-xs text-ink-faint">{m.better === 'high' ? 'higher = better' : 'lower = better'}</span>
            </div>
            <div className="grid grid-cols-11 gap-1">
              {Array.from({ length: 11 }, (_, i) => {
                const active = (form[m.key] as number | null) === i
                return (
                  <button
                    key={i}
                    onClick={() => setNum(m.key, i)}
                    className={`aspect-square rounded-md text-xs font-semibold transition ${
                      active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft hover:bg-slate-200'
                    }`}
                  >
                    {i}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label mb-1">Word-swaps this week</label>
            <input
              type="number"
              min={0}
              className="field"
              value={form.swap_count ?? 0}
              onChange={(e) => setForm({ ...form, swap_count: Number(e.target.value) })}
            />
            <p className="mt-1 text-xs text-ink-faint">Suggested from your logs: {suggestedSwaps}</p>
          </div>
          <div>
            <label className="label mb-1">Routine days (of 7)</label>
            <input
              type="number"
              min={0}
              max={7}
              className="field"
              value={form.routine_days ?? 0}
              onChange={(e) => setForm({ ...form, routine_days: Number(e.target.value) })}
            />
            <p className="mt-1 text-xs text-ink-faint">Suggested: {suggestedRoutineDays}</p>
          </div>
        </div>

        <ReviewText label="My best speaking moment this week was…" value={(form.best_moment as string) ?? ''} onChange={(v) => setForm({ ...form, best_moment: v })} />
        <ReviewText label="My hardest moment was… and I responded by…" value={(form.hardest_moment as string) ?? ''} onChange={(v) => setForm({ ...form, hardest_moment: v })} />
        <ReviewText label="One thing I learned…" value={(form.learned as string) ?? ''} onChange={(v) => setForm({ ...form, learned: v })} />
        <ReviewText label="One thing I’ll adjust next week…" value={(form.adjust as string) ?? ''} onChange={(v) => setForm({ ...form, adjust: v })} />

        <div className="flex items-center gap-3">
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {existing ? 'Update this week' : 'Save this week'}
          </button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-emerald-700">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div className="mt-6 border-t border-slate-100 pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Past weeks</p>
          <div className="space-y-1.5">
            {reviews.slice(0, 6).map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                <span className="font-medium text-ink">{prettyDate(r.week_start)}</span>
                {r.confidence != null && <span className="text-ink-soft">conf {r.confidence}</span>}
                {r.anxiety != null && <span className="text-ink-soft">anx {r.anxiety}</span>}
                {r.ease != null && <span className="text-ink-soft">ease {r.ease}</span>}
                {r.routine_days != null && <span className="text-ink-soft">{r.routine_days}/7 days</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

function ReviewText({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label mb-1">{label}</label>
      <textarea className="field min-h-[54px] resize-y" value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}
