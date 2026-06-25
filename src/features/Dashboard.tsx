import { useEffect, useState } from 'react'
import {
  Wind, Trophy, NotebookPen, TrendingUp, ArrowRight,
  Quote, ListChecks, Repeat, Sparkles, Target, Flame, Zap, ChevronRight,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { ROUTINE_TASKS, ENCOURAGEMENTS, LADDER_LEVELS } from '../lib/content'
import type { RoutineDay, SwapEvent } from '../lib/types'
import { todayStr, greetingForNow, prettyDateLong } from '../lib/dates'
import { Card, ProgressRing } from '../components/ui'
import type { View } from '../lib/nav'
import { getTodaysChallenges, getXpLevel, getXpProgress } from '../lib/xp'
import type { ChallengeCompletion } from '../lib/types'

export default function Dashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const { user } = useAuth()
  const { profile, awardXp } = useProfile()
  const [routine, setRoutine] = useState<RoutineDay | null>(null)
  const [todaySwaps, setTodaySwaps] = useState<SwapEvent[]>([])
  const [todayCompletions, setTodayCompletions] = useState<ChallengeCompletion[]>([])
  const [winFlash, setWinFlash] = useState(false)
  const day = todayStr()

  const load = async () => {
    if (!user) return
    const [r, s, c] = await Promise.all([
      supabase.from('sc_routine_days').select('*').eq('user_id', user.id).eq('day', day).maybeSingle(),
      supabase.from('sc_swap_events').select('*').eq('user_id', user.id).eq('day', day),
      supabase.from('sc_challenge_completions').select('*').eq('user_id', user.id).eq('day', day),
    ])
    setRoutine((r.data as RoutineDay) ?? null)
    setTodaySwaps((s.data as SwapEvent[]) ?? [])
    setTodayCompletions((c.data as ChallengeCompletion[]) ?? [])
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
    if (data) {
      setTodaySwaps(prev => [...prev, data as SwapEvent])
      await awardXp(15)
    }
  }

  const doneCount  = routine ? ROUTINE_TASKS.filter(t => routine[t.key]).length : 0
  const pct        = doneCount / ROUTINE_TASKS.length
  const winsToday  = todaySwaps.filter(e => e.said_anyway).length

  // Stable per-day encouragement
  const dayIndex = Math.floor(new Date(day + 'T00:00:00').getTime() / 86400000)
  const quote    = ENCOURAGEMENTS[dayIndex % ENCOURAGEMENTS.length]

  const name   = profile?.display_name?.trim()
  const level  = profile?.current_level ?? 1
  const xp     = profile?.xp ?? 0
  const streak = profile?.streak_count ?? 0
  const xpLvl  = getXpLevel(xp)
  const prog   = getXpProgress(xp)

  // Today's gold challenge preview
  const todayChallenge = getTodaysChallenges(day)
  const goldDone       = todayCompletions.some(c => c.challenge_key === todayChallenge.gold.key)
  const challengesXpToday = todayCompletions.reduce((s, c) => s + c.xp_earned, 0)

  return (
    <div className="space-y-5">

      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-extrabold text-ink dark:text-slate-100 sm:text-3xl">
          {greetingForNow()}{name ? `, ${name}` : ''}.
        </h1>
        <p className="text-sm text-ink-soft dark:text-slate-400">{prettyDateLong(day)}</p>
      </div>

      {/* XP + Streak banner */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-[#0f172a] p-4 text-white shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
              <Zap className="h-5 w-5 text-brand-300" />
            </div>
            <div>
              <p className={`text-xs font-bold ${xpLvl.colorClass}`}>
                Lv {xpLvl.level} · {xpLvl.title}
              </p>
              <p className="text-sm font-bold text-white">{xp} XP</p>
            </div>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl bg-orange-500/20 px-3 py-1.5">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-extrabold text-orange-300">{streak}d</span>
            </div>
          )}
        </div>
        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-1.5 rounded-full bg-gradient-to-r ${xpLvl.barColor} transition-all duration-700`}
            style={{ width: `${Math.round(prog * 100)}%` }}
          />
        </div>
        {challengesXpToday > 0 && (
          <p className="mt-2 text-xs text-slate-400">+{challengesXpToday} XP from challenges today</p>
        )}
      </div>

      {/* Today's gold challenge teaser */}
      <button
        onClick={() => onNavigate('challenges')}
        className={`w-full text-left card p-4 border transition hover:shadow-md dark:hover:shadow-slate-900/60 ${
          goldDone
            ? 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/10'
            : 'border-brand-500/20 bg-brand-50/50 dark:bg-brand-900/10'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-brand-500" />
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              Today's gold challenge
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-ink-faint dark:text-slate-500" />
        </div>
        <p className={`font-semibold text-sm ${goldDone ? 'line-through text-ink-faint dark:text-slate-500' : 'text-ink dark:text-slate-200'}`}>
          {todayChallenge.gold.emoji} {todayChallenge.gold.text}
        </p>
        <p className="mt-1 text-xs text-ink-faint dark:text-slate-500">
          {goldDone ? '✓ Completed · +75 XP' : `+75 XP · ${todayCompletions.length}/3 challenges done today`}
        </p>
      </button>

      {/* Encouragement */}
      <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-700 dark:to-brand-900 p-5 text-white shadow-sm">
        <Quote className="h-5 w-5 text-brand-200" />
        <p className="mt-2 text-lg font-semibold leading-snug">{quote}</p>
      </div>

      {/* Routine + quick win */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <button onClick={() => onNavigate('routine')} className="flex w-full items-center gap-4 text-left">
            <ProgressRing value={pct} size={60}>
              <span className="text-sm font-bold text-ink dark:text-slate-200">
                {doneCount}/{ROUTINE_TASKS.length}
              </span>
            </ProgressRing>
            <div className="flex-1">
              <p className="flex items-center gap-1.5 font-bold text-ink dark:text-slate-100">
                <ListChecks className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Today's routine
              </p>
              <p className="text-sm text-ink-soft dark:text-slate-400">
                {doneCount === ROUTINE_TASKS.length
                  ? 'All done — a promise kept. ✦'
                  : doneCount === 0
                    ? 'Start with one small piece.'
                    : 'Nice momentum — keep going.'}
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-ink-faint dark:text-slate-500" />
          </button>
        </Card>

        <Card>
          <p className="flex items-center gap-1.5 font-bold text-ink dark:text-slate-100">
            <Repeat className="h-4 w-4 text-brand-600 dark:text-brand-400" /> Word-swap lever
          </p>
          <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">
            {winsToday > 0
              ? `${winsToday} time${winsToday > 1 ? 's' : ''} you said the real word today.`
              : 'Said a hard word anyway? Mark the win.'}
          </p>
          <button
            onClick={logWin}
            className={`btn mt-3 w-full bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 ${winFlash ? 'animate-pop' : ''}`}
          >
            <Trophy className="h-4 w-4" /> {winFlash ? "That's a win! 💪 +15 XP" : 'I said it anyway'}
          </button>
        </Card>
      </div>

      {/* Quick tools */}
      <Card>
        <p className="mb-3 text-sm font-semibold text-ink-soft dark:text-slate-400">Quick tools</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickTool icon={<Wind className="h-5 w-5" />}        label="Breathe"    sublabel="90 seconds" onClick={() => onNavigate('calm')} />
          <QuickTool icon={<NotebookPen className="h-5 w-5" />} label="Reflect"    sublabel="tonight"    onClick={() => onNavigate('journal')} />
          <QuickTool icon={<TrendingUp className="h-5 w-5" />}  label="Ladder"     sublabel={`Level ${level}`} onClick={() => onNavigate('ladder')} />
          <QuickTool icon={<Sparkles className="h-5 w-5" />}    label="Reframe"    sublabel="a thought"  onClick={() => onNavigate('reframe')} />
        </div>
      </Card>

      {/* Current ladder focus */}
      <Card>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">Your current step</p>
            <p className="mt-1 text-lg font-bold text-ink dark:text-slate-100">
              Level {level}: {LADDER_LEVELS[level - 1].title}
            </p>
            <p className="mt-1 text-sm text-ink-soft dark:text-slate-400">{LADDER_LEVELS[level - 1].goal}</p>
          </div>
          <ProgressRing value={level / 12} size={52} stroke={5}>
            <span className="text-xs font-bold text-ink dark:text-slate-200">{level}/12</span>
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
  icon, label, sublabel, onClick,
}: {
  icon: React.ReactNode
  label: string
  sublabel: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 dark:bg-slate-700/50 p-4 text-center transition hover:bg-brand-50 dark:hover:bg-brand-900/30"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm">
        {icon}
      </span>
      <span className="text-sm font-semibold text-ink dark:text-slate-200">{label}</span>
      <span className="text-[11px] text-ink-faint dark:text-slate-500">{sublabel}</span>
    </button>
  )
}
