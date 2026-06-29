import { useEffect, useState } from 'react'
import {
  Wind, Trophy, NotebookPen, TrendingUp, ArrowRight,
  Quote, ListChecks, Repeat, Sparkles, Target, Flame, Zap, ChevronRight,
  Check, X,
} from 'lucide-react'

const HABITS = [
  { key: 'coffee',  emoji: '☕', label: 'Morning coffee',  cue: 'After your morning coffee' },
  { key: 'teeth',   emoji: '🪥', label: 'Brush teeth',     cue: 'After brushing your teeth' },
  { key: 'shower',  emoji: '🚿', label: 'Morning shower',  cue: 'After your morning shower' },
  { key: 'lunch',   emoji: '🍽️', label: 'Lunch',           cue: 'After lunch' },
  { key: 'bed',     emoji: '🌙', label: 'Before bed',      cue: 'Before you go to bed' },
] as const
type HabitKey = typeof HABITS[number]['key']
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

  const [habitKey, setHabitKey] = useState<HabitKey | null>(
    () => localStorage.getItem('steady_habit_anchor') as HabitKey | null
  )
  const [showHabitSetup, setShowHabitSetup] = useState(false)
  const [coachDoneToday, setCoachDoneToday] = useState(
    () => localStorage.getItem('steady_coach_date') === day
  )

  const saveHabit = (key: HabitKey) => {
    localStorage.setItem('steady_habit_anchor', key)
    setHabitKey(key)
    setShowHabitSetup(false)
  }
  const clearHabit = () => {
    localStorage.removeItem('steady_habit_anchor')
    setHabitKey(null)
    setShowHabitSetup(false)
  }

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

  // Re-check coach goal when user navigates back to this tab/page
  useEffect(() => {
    const refresh = () => setCoachDoneToday(localStorage.getItem('steady_coach_date') === day)
    document.addEventListener('visibilitychange', refresh)
    return () => document.removeEventListener('visibilitychange', refresh)
  }, [day])

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

  // Daily goals + focus computation
  const goals = [
    {
      id: 'routine',
      done: doneCount === ROUTINE_TASKS.length,
      label: 'Complete your daily routine',
      sublabel: doneCount === 0 ? 'Not started yet' : `${doneCount} of ${ROUTINE_TASKS.length} done`,
      onGo: () => onNavigate('routine'),
    },
    {
      id: 'coach',
      done: coachDoneToday,
      label: 'Practice with the AI Coach',
      sublabel: coachDoneToday ? 'Done today' : 'Speak a real scenario out loud',
      onGo: () => onNavigate('coach'),
    },
    {
      id: 'challenge',
      done: goldDone,
      label: "Today's gold challenge",
      sublabel: goldDone ? 'Done · +75 XP' : `${todayChallenge.gold.emoji} ${todayChallenge.gold.text}`,
      onGo: () => onNavigate('challenges'),
    },
  ]
  const firstIncomplete = goals.find(g => !g.done)
  const goalsDoneCount  = goals.filter(g => g.done).length
  const activeHabit     = HABITS.find(h => h.key === habitKey)

  return (
    <div className="space-y-5">

      {/* Greeting */}
      <div className="animate-fade-in">
        <h1 className="text-2xl font-extrabold text-ink dark:text-slate-100 sm:text-3xl">
          {greetingForNow()}{name ? `, ${name}` : ''}.
        </h1>
        <p className="text-sm text-ink-soft dark:text-slate-400">{prettyDateLong(day)}</p>
      </div>

      {/* ── TODAY'S ONE THING ─────────────────────────────────────────────────── */}
      <div className="animate-fade-in rounded-2xl bg-gradient-to-br from-violet-600 via-brand-600 to-brand-700 p-5 text-white shadow-lg">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-white/50">
          Today's one thing
        </p>
        {firstIncomplete ? (
          <>
            <p className="text-xl font-extrabold leading-tight">{firstIncomplete.label}</p>
            <p className="mt-1 text-sm text-white/70">{firstIncomplete.sublabel}</p>
            <button
              onClick={firstIncomplete.onGo}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-3 text-sm font-bold transition hover:bg-white/30 active:scale-95"
            >
              Start now <ArrowRight className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <p className="text-xl font-extrabold">All 3 goals done today!</p>
            <p className="mt-1 text-sm text-white/70">Incredible consistency. Extra practice?</p>
            <button
              onClick={() => onNavigate('coach')}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-3 text-sm font-bold transition hover:bg-white/30"
            >
              Practice again <ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* ── TODAY'S GOALS ─────────────────────────────────────────────────────── */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-ink dark:text-slate-100">Today's goals</p>
          <span className={`text-xs font-bold ${goalsDoneCount === 3 ? 'text-emerald-500' : 'text-brand-500 dark:text-brand-400'}`}>
            {goalsDoneCount} / 3
          </span>
        </div>
        <div className="space-y-1">
          {goals.map(g => (
            <button
              key={g.id}
              onClick={g.onGo}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/60"
            >
              <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                g.done
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {g.done && <Check className="h-3.5 w-3.5" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold ${
                  g.done ? 'text-ink-faint dark:text-slate-500 line-through' : 'text-ink dark:text-slate-200'
                }`}>
                  {g.label}
                </p>
                <p className="text-xs text-ink-faint dark:text-slate-500">{g.sublabel}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint dark:text-slate-600" />
            </button>
          ))}
        </div>
      </Card>

      {/* ── HABIT STACK ───────────────────────────────────────────────────────── */}
      {activeHabit ? (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-900/10 px-4 py-3">
          <span className="shrink-0 select-none text-2xl">{activeHabit.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-ink dark:text-slate-100">{activeHabit.cue}</p>
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
              → open Steady and practice speaking
            </p>
          </div>
          <button
            onClick={() => setShowHabitSetup(true)}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-ink-faint dark:text-slate-500 transition hover:text-ink dark:hover:text-slate-300"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowHabitSetup(true)}
          className="flex w-full items-center gap-3 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-left transition hover:border-brand-400 hover:bg-brand-50/50 dark:hover:bg-brand-900/20"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400">
            <Repeat className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-ink dark:text-slate-100">Add a habit reminder</p>
            <p className="text-xs text-ink-faint dark:text-slate-500">
              Link speaking practice to something you already do every day
            </p>
          </div>
          <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-ink-faint dark:text-slate-500" />
        </button>
      )}

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

      {/* ── HABIT SETUP MODAL ─────────────────────────────────────────────────── */}
      {showHabitSetup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowHabitSetup(false)}
          />
          <div className="relative w-full max-w-sm animate-fade-in rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="mb-1 flex items-center justify-between">
              <p className="text-lg font-extrabold text-ink dark:text-slate-100">Pick a daily habit</p>
              <button
                onClick={() => setShowHabitSetup(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-ink-faint dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-4 text-sm text-ink-soft dark:text-slate-400">
              Practice right after this habit every day. You'll never need to remember — it just happens.
            </p>
            <div className="space-y-2">
              {HABITS.map(h => (
                <button
                  key={h.key}
                  onClick={() => saveHabit(h.key)}
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                    habitKey === h.key
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/30 dark:border-brand-600'
                      : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="select-none text-2xl">{h.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-ink dark:text-slate-200">{h.label}</p>
                    <p className="text-xs text-ink-faint dark:text-slate-500">{h.cue} → practice speaking</p>
                  </div>
                  {habitKey === h.key && (
                    <Check className="ml-auto h-5 w-5 shrink-0 text-brand-500" />
                  )}
                </button>
              ))}
            </div>
            {habitKey && (
              <button
                onClick={clearHabit}
                className="mt-4 w-full text-center text-xs text-ink-faint dark:text-slate-500 transition hover:text-red-500 dark:hover:text-red-400"
              >
                Remove habit reminder
              </button>
            )}
          </div>
        </div>
      )}
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
