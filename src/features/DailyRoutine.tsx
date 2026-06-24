import { useEffect, useState } from 'react'
import { Check, ChevronDown, Wind, NotebookPen, Sun, Sparkles, Moon } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { ROUTINE_TASKS } from '../lib/content'
import type { RoutineDay, RoutineTask } from '../lib/types'
import { todayStr, prettyDateLong } from '../lib/dates'
import { Card, SectionTitle, Spinner, ProgressRing } from '../components/ui'
import VoiceRecorder from '../components/VoiceRecorder'
import type { View } from '../lib/nav'

const PHASE_ICON = { Morning: Sun, Practice: Sparkles, Evening: Moon } as const

export default function DailyRoutine({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { user } = useAuth()
  const [row, setRow] = useState<RoutineDay | null>(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState<RoutineTask | null>(null)
  const day = todayStr()

  useEffect(() => {
    if (!user) return
    ;(async () => {
      setLoading(true)
      await supabase.from('sc_routine_days').upsert({ user_id: user.id, day }, { onConflict: 'user_id,day', ignoreDuplicates: true })
      const { data } = await supabase.from('sc_routine_days').select('*').eq('user_id', user.id).eq('day', day).single()
      setRow(data as RoutineDay)
      setLoading(false)
    })()
  }, [user, day])

  const toggle = async (key: RoutineTask) => {
    if (!row || !user) return
    const next = !row[key]
    setRow({ ...row, [key]: next })
    await supabase
      .from('sc_routine_days')
      .update({ [key]: next, updated_at: new Date().toISOString() })
      .eq('id', row.id)
  }

  if (loading || !row) return <Spinner label="Loading today…" />

  const done = ROUTINE_TASKS.filter((t) => row[t.key]).length
  const pct = done / ROUTINE_TASKS.length

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center gap-4">
          <ProgressRing value={pct} size={64}>
            <span className="text-sm font-bold text-ink">
              {done}/{ROUTINE_TASKS.length}
            </span>
          </ProgressRing>
          <div>
            <h1 className="text-xl font-extrabold text-ink">Today’s routine</h1>
            <p className="text-sm text-ink-soft">{prettyDateLong(day)}</p>
          </div>
        </div>
        <p className="mt-4 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-800">
          {done === ROUTINE_TASKS.length
            ? 'Every piece done today. That’s a promise kept to yourself — exactly how self-trust is built.'
            : 'Tiny and repeated beats big and rare. Even one piece today keeps the line moving.'}
        </p>
      </Card>

      {(['Morning', 'Practice', 'Evening'] as const).map((phase) => {
        const Icon = PHASE_ICON[phase]
        const tasks = ROUTINE_TASKS.filter((t) => t.phase === phase)
        return (
          <Card key={phase}>
            <SectionTitle title={phase} icon={<Icon className="h-5 w-5" />} />
            <div className="space-y-2.5">
              {tasks.map((t) => {
                const checked = row[t.key]
                const isOpen = open === t.key
                return (
                  <div key={t.key} className="rounded-xl border border-slate-100">
                    <div className="flex items-start gap-3 p-3">
                      <button
                        onClick={() => toggle(t.key)}
                        aria-label={`Mark ${t.title} ${checked ? 'incomplete' : 'complete'}`}
                        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition ${
                          checked ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 hover:border-brand-400'
                        }`}
                      >
                        {checked && <Check className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setOpen(isOpen ? null : t.key)} className="flex-1 text-left">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-semibold ${checked ? 'text-ink-faint line-through' : 'text-ink'}`}>
                            {t.title}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-ink-faint">
                            {t.minutes}
                            <ChevronDown className={`h-4 w-4 transition ${isOpen ? 'rotate-180' : ''}`} />
                          </span>
                        </div>
                      </button>
                    </div>

                    {isOpen && (
                      <div className="animate-fade-in border-t border-slate-100 px-3 pb-3 pt-3 text-sm">
                        <p className="text-ink-soft">{t.how}</p>
                        <p className="mt-2 text-xs italic text-ink-faint">Why: {t.why}</p>

                        {t.key === 'morning_prime' && (
                          <button className="btn-soft mt-3" onClick={() => onNavigate('calm')}>
                            <Wind className="h-4 w-4" /> Open a breathing exercise
                          </button>
                        )}
                        {t.key === 'real_rep' && (
                          <div className="mt-3">
                            <VoiceRecorder />
                          </div>
                        )}
                        {t.key === 'evening_reflect' && (
                          <button className="btn-soft mt-3" onClick={() => onNavigate('journal')}>
                            <NotebookPen className="h-4 w-4" /> Write tonight’s reflection
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
