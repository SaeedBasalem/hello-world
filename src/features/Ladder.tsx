import { useEffect, useState } from 'react'
import { Check, Lock, ChevronDown, Flag, TrendingUp, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { LADDER_LEVELS } from '../lib/content'
import type { LadderAttempt } from '../lib/types'
import { Card, SectionTitle, AnxietyScale, Spinner, Pill } from '../components/ui'
import { prettyDate } from '../lib/dates'

export default function Ladder() {
  const { user } = useAuth()
  const { profile, update } = useProfile()
  const current = profile?.current_level ?? 1

  const [attempts, setAttempts] = useState<LadderAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [openLevel, setOpenLevel] = useState<number | null>(current)

  // attempt form
  const [before, setBefore] = useState<number | null>(null)
  const [after, setAfter] = useState<number | null>(null)
  const [success, setSuccess] = useState(true)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    if (!user) return
    const { data } = await supabase
      .from('sc_ladder_attempts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setAttempts((data as LadderAttempt[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const logAttempt = async (level: number) => {
    if (!user) return
    setSaving(true)
    await supabase.from('sc_ladder_attempts').insert({
      user_id: user.id,
      level,
      anxiety_before: before,
      anxiety_after: after,
      success,
      notes: notes.trim() || null,
    })
    setBefore(null)
    setAfter(null)
    setSuccess(true)
    setNotes('')
    setSaving(false)
    await load()
  }

  if (loading) return <Spinner label="Loading your ladder…" />

  const countFor = (lvl: number) => attempts.filter((a) => a.level === lvl).length

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          title="The exposure ladder"
          subtitle="Climb in order, but let readiness set the pace — not the calendar. Repeating a level is fine; dropping back on a hard day is fine too."
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3">
          <Flag className="h-5 w-5 text-brand-600" />
          <p className="text-sm text-brand-800">
            You’re on <span className="font-bold">Level {current}</span> — {LADDER_LEVELS[current - 1].title}.
            Move up when this level sits around 3–4/10 and you’ve succeeded a few times.
          </p>
        </div>
      </Card>

      <div className="space-y-2.5">
        {LADDER_LEVELS.map((lvl) => {
          const status: 'done' | 'current' | 'upcoming' =
            lvl.level < current ? 'done' : lvl.level === current ? 'current' : 'upcoming'
          const isOpen = openLevel === lvl.level
          const count = countFor(lvl.level)
          const levelAttempts = attempts.filter((a) => a.level === lvl.level)

          return (
            <div
              key={lvl.level}
              className={`card overflow-hidden transition ${status === 'current' ? 'ring-2 ring-brand-300' : ''}`}
            >
              <button
                className="flex w-full items-center gap-3 p-4 text-left"
                onClick={() => setOpenLevel(isOpen ? null : lvl.level)}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    status === 'done'
                      ? 'bg-emerald-500 text-white'
                      : status === 'current'
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-ink-faint'
                  }`}
                >
                  {status === 'done' ? <Check className="h-5 w-5" /> : status === 'upcoming' ? <Lock className="h-4 w-4" /> : lvl.level}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${status === 'upcoming' ? 'text-ink-faint' : 'text-ink'}`}>
                      {lvl.level}. {lvl.title}
                    </span>
                    {count > 0 && <Pill tone="green">{count} logged</Pill>}
                  </div>
                  <p className="truncate text-xs text-ink-faint">{lvl.duration}</p>
                </div>
                <ChevronDown className={`h-5 w-5 shrink-0 text-ink-faint transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="animate-fade-in border-t border-slate-100 p-4">
                  <p className="text-sm text-ink-soft">{lvl.goal}</p>
                  <p className="mt-2 text-xs italic text-ink-faint">Ready to move up when: {lvl.readyWhen}</p>

                  {/* set-current controls */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lvl.level !== current && (
                      <button className="btn-soft text-xs" onClick={() => update({ current_level: lvl.level })}>
                        Set as my current level
                      </button>
                    )}
                    {lvl.level === current && current < 12 && (
                      <button className="btn-primary text-xs" onClick={() => update({ current_level: current + 1 })}>
                        <TrendingUp className="h-3.5 w-3.5" /> I’m ready — move up
                      </button>
                    )}
                    {lvl.level === current && current > 1 && (
                      <button className="btn-ghost text-xs" onClick={() => update({ current_level: current - 1 })}>
                        Step back a level
                      </button>
                    )}
                  </div>

                  {/* log an attempt */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="mb-3 text-sm font-semibold text-ink">Log an attempt at this level</p>
                    <div className="space-y-3">
                      <AnxietyScale label="Anxiety before" value={before} onChange={setBefore} />
                      <AnxietyScale label="Anxiety after" value={after} onChange={setAfter} />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-ink-soft">How did it go?</span>
                        <button
                          onClick={() => setSuccess(true)}
                          className={`chip ${success ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-ink-soft'}`}
                        >
                          I did it
                        </button>
                        <button
                          onClick={() => setSuccess(false)}
                          className={`chip ${!success ? 'bg-warm-100 text-warm-600' : 'bg-slate-100 text-ink-soft'}`}
                        >
                          Tough — and that’s data
                        </button>
                      </div>
                      <textarea
                        className="field min-h-[60px] resize-y"
                        placeholder="What happened? What did you notice? (optional)"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <button className="btn-primary" onClick={() => logAttempt(lvl.level)} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 animate-spin" />} Log attempt
                      </button>
                    </div>
                  </div>

                  {levelAttempts.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">
                        Your attempts
                      </p>
                      <ul className="space-y-1.5">
                        {levelAttempts.map((a) => (
                          <li key={a.id} className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm ring-1 ring-slate-100">
                            <span className={a.success ? 'text-emerald-600' : 'text-warm-500'}>
                              {a.success ? <Check className="h-4 w-4" /> : '•'}
                            </span>
                            <span className="text-ink-faint">{prettyDate(a.created_at.slice(0, 10))}</span>
                            {a.anxiety_before != null && a.anxiety_after != null && (
                              <span className="text-ink-soft">
                                {a.anxiety_before} → {a.anxiety_after}
                              </span>
                            )}
                            {a.notes && <span className="truncate text-ink-soft">· {a.notes}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <p className="px-1 text-center text-xs text-ink-faint">
        Toastmasters (or any structured speaking group) is a low-cost, repeatable exposure machine with a
        built-in friendly audience — ideal around Level 12.
      </p>
    </div>
  )
}
