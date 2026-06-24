import { useEffect, useState } from 'react'
import { NotebookPen, Loader2, Trash2, Check, Star, CloudRain, Sunrise } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { JournalEntry } from '../lib/types'
import { todayStr, prettyDate, prettyDateLong } from '../lib/dates'
import { Card, SectionTitle, Spinner, AnxietyScale, EmptyState } from '../components/ui'

export default function Journal() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)

  const [todayId, setTodayId] = useState<string | null>(null)
  const [win, setWin] = useState('')
  const [hard, setHard] = useState('')
  const [response, setResponse] = useState('')
  const [tomorrow, setTomorrow] = useState('')
  const [anxiety, setAnxiety] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)

  const day = todayStr()

  const load = async () => {
    if (!user) return
    const { data } = await supabase
      .from('sc_journal_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    const all = (data as JournalEntry[]) ?? []
    setEntries(all)
    const todays = all.find((e) => e.day === day)
    if (todays) {
      setTodayId(todays.id)
      setWin(todays.win ?? '')
      setHard(todays.hard_moment ?? '')
      setResponse(todays.response ?? '')
      setTomorrow(todays.try_tomorrow ?? '')
      setAnxiety(todays.anxiety_rating ?? null)
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const save = async () => {
    if (!user) return
    setSaving(true)
    const payload = {
      user_id: user.id,
      day,
      win: win.trim() || null,
      hard_moment: hard.trim() || null,
      response: response.trim() || null,
      try_tomorrow: tomorrow.trim() || null,
      anxiety_rating: anxiety,
    }
    if (todayId) {
      await supabase.from('sc_journal_entries').update(payload).eq('id', todayId)
    } else {
      const { data } = await supabase.from('sc_journal_entries').insert(payload).select('*').single()
      if (data) setTodayId((data as JournalEntry).id)
    }
    // Mark the evening-reflect routine task done for today.
    await supabase.from('sc_routine_days').upsert({ user_id: user.id, day }, { onConflict: 'user_id,day', ignoreDuplicates: true })
    await supabase
      .from('sc_routine_days')
      .update({ evening_reflect: true, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('day', day)

    setSaving(false)
    setSavedFlash(true)
    setTimeout(() => setSavedFlash(false), 2500)
    await load()
  }

  const remove = async (id: string) => {
    setEntries(entries.filter((e) => e.id !== id))
    await supabase.from('sc_journal_entries').delete().eq('id', id)
    if (id === todayId) {
      setTodayId(null)
      setWin('')
      setHard('')
      setResponse('')
      setTomorrow('')
      setAnxiety(null)
    }
  }

  const past = entries.filter((e) => e.id !== todayId)

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          title="Today’s reflection"
          subtitle={prettyDateLong(day)}
          icon={<NotebookPen className="h-5 w-5" />}
        />
        <p className="mb-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-ink-soft">
          Self-criticism is loud and has good memory; wins are quiet and forgettable. Writing them down builds
          the evidence file your inner critic doesn’t want you to have.
        </p>

        <div className="space-y-4">
          <Field icon={<Star className="h-4 w-4 text-warm-500" />} label="One win, however small" value={win} onChange={setWin} placeholder="What went even slightly well today?" />
          <Field icon={<CloudRain className="h-4 w-4 text-brand-400" />} label="One hard moment" value={hard} onChange={setHard} placeholder="What was tough?" />
          <Field label="…and how I responded" value={response} onChange={setResponse} placeholder="Not whether you stuttered — how you met it." hint="The response is the part that matters." />
          <Field icon={<Sunrise className="h-4 w-4 text-warm-500" />} label="One thing to try tomorrow" value={tomorrow} onChange={setTomorrow} placeholder="A small, doable intention." />
          <AnxietyScale label="Overall anxiety today (optional)" value={anxiety} onChange={setAnxiety} />
        </div>

        <div className="mt-5 flex items-center gap-3">
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {todayId ? 'Update reflection' : 'Save reflection'}
          </button>
          {savedFlash && (
            <span className="flex items-center gap-1 text-sm text-emerald-700">
              <Check className="h-4 w-4" /> Saved
            </span>
          )}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Past reflections" subtitle="Your evidence file, growing." />
        {loading ? (
          <Spinner />
        ) : past.length === 0 ? (
          <EmptyState
            icon={<NotebookPen className="h-8 w-8" />}
            title="Your story starts here"
            body="Tonight’s reflection will be the first entry. Come back tomorrow and you’ll have a thread to follow."
          />
        ) : (
          <ul className="space-y-3">
            {past.map((e) => (
              <li key={e.id} className="rounded-xl border border-slate-100 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink">{prettyDate(e.day)}</span>
                  <div className="flex items-center gap-2">
                    {e.anxiety_rating != null && (
                      <span className="chip bg-slate-100 text-ink-soft">anxiety {e.anxiety_rating}</span>
                    )}
                    <button onClick={() => remove(e.id)} className="text-ink-faint hover:text-red-500" aria-label="Delete">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm">
                  {e.win && <p><span className="font-medium text-warm-600">Win:</span> <span className="text-ink-soft">{e.win}</span></p>}
                  {e.hard_moment && <p><span className="font-medium text-brand-600">Hard:</span> <span className="text-ink-soft">{e.hard_moment}</span></p>}
                  {e.response && <p><span className="font-medium text-ink">Responded:</span> <span className="text-ink-soft">{e.response}</span></p>}
                  {e.try_tomorrow && <p><span className="font-medium text-ink">Next:</span> <span className="text-ink-soft">{e.try_tomorrow}</span></p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  icon?: React.ReactNode
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <div>
      <label className="label mb-1 flex items-center gap-1.5">
        {icon} {label}
      </label>
      {hint && <p className="mb-1.5 text-xs text-ink-faint">{hint}</p>}
      <textarea
        className="field min-h-[60px] resize-y"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}
