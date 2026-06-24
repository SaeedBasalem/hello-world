import { useEffect, useState } from 'react'
import {
  Wind,
  Trophy,
  NotebookPen,
  TrendingUp,
  ArrowRight,
  Quote,
  ListChecks,
  Repeat,
  Sparkles,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { ROUTINE_TASKS, ENCOURAGEMENTS, LADDER_LEVELS } from '../lib/content'
import type { RoutineDay, SwapEvent } from '../lib/types'
import { todayStr, greetingForNow, prettyDateLong } from '../lib/dates'
import { Card, ProgressRing } from '../components/ui'
import type { View } from '../lib/nav'

export default function Dashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [routine, setRoutine] = useState<RoutineDay | null>(null)
  const [todaySwaps, setTodaySwaps] = useState<SwapEvent[]>([])
  const [winFlash, setWinFlash] = useState(false)
  const day = todayStr()

  const load = async () => {
    if (!user) return
    const [r, s] = await Promise.all([
      supabase.from('sc_routine_days').select('*').eq('user_id', user.id).eq('day', day).maybeSingle(),
      supabase.from('sc_swap_events').select('*').eq('user_id', user.id).eq('day', day),
    ])
    setRoutine((r.data as RoutineDay) ?? null)
    setTodaySwaps((s.data as SwapEvent[]) ?? [])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const logWin = async () => {
    if (!user) return
    setWinFlash(true)
    setTimeout(() => setWinFlash(false), 1400)
    const { data } = await supabase
      .from('sc_swap_events')
      .insert({ user_id: user.id, said_anyway: true })
      .select('*')
      .single()
    if (data) setTodaySwaps((prev) => [...prev, data as SwapEvent])
  }

  const doneCount = routine
    ? ROUTINE_TASKS.filter((t) => routine[t.key]).length
    : 0
  const pct = doneCount / ROUTINE_TASKS.length
  const winsToday = todaySwaps.filter((e) => e.said_anyway).length

  // Stable per-day encouragement.
  const dayIndex = Math.floor(new Date(day + 'T00:00:00').getTime() / 86400000)
  const quote = ENCOURAGEMENTS[dayIndex % ENCOURAGEMENTS.length]
  const name = profile?.display_name?.trim()
  const level = profile?.current_level ?? 1

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          {greetingForNow()}
          {name ? `, ${name}` : ''}.
        </h1>
        <p className="text-sm text-ink-soft">{prettyDateLong(day)}</p>
      </div>

      {/* Encouragement */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-5 text-white shadow-sm">
        <Quote className="h-5 w-5 text-brand-200" />
        <p className="mt-2 text-lg font-semibold leading-snug">{quote}</p>
      </div>

      {/* Today's routine + quick win */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <button onClick={() => onNavigate('routine')} className="flex w-full items-center gap-4 text-left">
            <ProgressRing value={pct} size={60}>
              <span className="text-sm font-bold text-ink">
                {doneCount}/{ROUTINE_TASKS.length}
              </span>
            </ProgressRing>
            <div className="flex-1">
              <p className="flex items-center gap-1.5 font-bold text-ink">
                <ListChecks className="h-4 w-4 text-brand-600" /> Today’s routine
              </p>
              <p className="text-sm text-ink-soft">
                {doneCount === ROUTINE_TASKS.length
                  ? 'All done — a promise kept. ✦'
                  : doneCount === 0
                    ? 'Start with one small piece.'
                    : 'Nice momentum — keep going.'}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-ink-faint" />
          </button>
        </Card>

        <Card>
          <p className="flex items-center gap-1.5 font-bold text-ink">
            <Repeat className="h-4 w-4 text-brand-600" /> Word-swap lever
          </p>
          <p className="mt-1 text-sm text-ink-soft">
            {winsToday > 0
              ? `${winsToday} time${winsToday > 1 ? 's' : ''} you said the real word today.`
              : 'Said a hard word anyway? Mark the win.'}
          </p>
          <button
            onClick={logWin}
            className={`btn mt-3 w-full bg-emerald-500 text-white hover:bg-emerald-600 ${winFlash ? 'animate-pop' : ''}`}
          >
            <Trophy className="h-4 w-4" /> {winFlash ? 'That’s a win! 💪' : 'I said it anyway'}
          </button>
        </Card>
      </div>

      {/* Quick tools */}
      <Card>
        <p className="mb-3 text-sm font-semibold text-ink-soft">Quick tools</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickTool icon={<Wind className="h-5 w-5" />} label="Breathe" sublabel="90 seconds" onClick={() => onNavigate('calm')} />
          <QuickTool icon={<NotebookPen className="h-5 w-5" />} label="Reflect" sublabel="tonight" onClick={() => onNavigate('journal')} />
          <QuickTool icon={<TrendingUp className="h-5 w-5" />} label="Ladder" sublabel={`Level ${level}`} onClick={() => onNavigate('ladder')} />
          <QuickTool icon={<Sparkles className="h-5 w-5" />} label="Reframe" sublabel="a thought" onClick={() => onNavigate('reframe')} />
        </div>
      </Card>

      {/* Current ladder focus */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Your current step</p>
            <p className="mt-1 text-lg font-bold text-ink">
              Level {level}: {LADDER_LEVELS[level - 1].title}
            </p>
            <p className="mt-1 text-sm text-ink-soft">{LADDER_LEVELS[level - 1].goal}</p>
          </div>
          <ProgressRing value={level / 12} size={52} stroke={5}>
            <span className="text-xs font-bold text-ink">{level}/12</span>
          </ProgressRing>
        </div>
        <button className="btn-soft mt-4" onClick={() => onNavigate('ladder')}>
          Open the ladder <ArrowRight className="h-4 w-4" />
        </button>
      </Card>
    </div>
  )
}

function QuickTool({
  icon,
  label,
  sublabel,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  sublabel: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 p-4 text-center transition hover:bg-brand-50"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
        {icon}
      </span>
      <span className="text-sm font-semibold text-ink">{label}</span>
      <span className="text-[11px] text-ink-faint">{sublabel}</span>
    </button>
  )
}
