import { lazy, Suspense, useState } from 'react'
import {
  Home, CalendarCheck, Wind, TrendingUp, Repeat, Brain, NotebookPen,
  BarChart3, Compass, LogOut, Sparkles, Target, Sun, Moon, Flame, Zap,
} from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { ProfileProvider, useProfile } from './context/ProfileContext'
import { useTheme } from './context/ThemeContext'
import { NAV, type View } from './lib/nav'
import { APP_NAME } from './lib/content'
import { Spinner } from './components/ui'
import { getXpLevel, getXpProgress } from './lib/xp'

import AuthScreen from './components/AuthScreen'
import Onboarding from './features/Onboarding'

const Dashboard    = lazy(() => import('./features/Dashboard'))
const Challenges   = lazy(() => import('./features/Challenges'))
const DailyRoutine = lazy(() => import('./features/DailyRoutine'))
const Calm         = lazy(() => import('./features/Calm'))
const Ladder       = lazy(() => import('./features/Ladder'))
const SwapTracker  = lazy(() => import('./features/SwapTracker'))
const Reframe      = lazy(() => import('./features/Reframe'))
const Journal      = lazy(() => import('./features/Journal'))
const Progress     = lazy(() => import('./features/Progress'))
const PlanReference = lazy(() => import('./features/PlanReference'))

const ICONS: Record<View, React.ComponentType<{ className?: string }>> = {
  dashboard:  Home,
  challenges: Target,
  routine:    CalendarCheck,
  calm:       Wind,
  ladder:     TrendingUp,
  swaps:      Repeat,
  reframe:    Brain,
  journal:    NotebookPen,
  progress:   BarChart3,
  plan:       Compass,
}

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900">
        <Spinner label="Loading Steady…" />
      </div>
    )
  }

  if (!session) return <AuthScreen />

  return (
    <ProfileProvider>
      <Shell />
    </ProfileProvider>
  )
}

function Shell() {
  const { profile, loading } = useProfile()
  const { signOut } = useAuth()
  const { theme, toggle } = useTheme()
  const [view, setView] = useState<View>('dashboard')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-slate-900">
        <Spinner label="Getting things ready…" />
      </div>
    )
  }

  if (profile && !profile.onboarded) return <Onboarding />

  const go = (v: View) => {
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const xp     = profile?.xp ?? 0
  const streak = profile?.streak_count ?? 0
  const level  = getXpLevel(xp)
  const prog   = getXpProgress(xp)

  const screen = () => {
    switch (view) {
      case 'dashboard':  return <Dashboard onNavigate={go} />
      case 'challenges': return <Challenges />
      case 'routine':    return <DailyRoutine onNavigate={go} />
      case 'calm':       return <Calm />
      case 'ladder':     return <Ladder />
      case 'swaps':      return <SwapTracker />
      case 'reframe':    return <Reframe />
      case 'journal':    return <Journal />
      case 'progress':   return <Progress />
      case 'plan':       return <PlanReference />
    }
  }

  const title = NAV.find(n => n.key === view)?.label ?? APP_NAME

  return (
    <div className="min-h-screen bg-[#f6f8f8] dark:bg-[#0f172a] lg:flex">

      {/* ── Desktop sidebar ── */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700/50 p-4 lg:flex">

        <div className="mb-5 flex items-center gap-2.5 px-2 pt-1">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-extrabold leading-none text-ink dark:text-slate-100">{APP_NAME}</p>
            <p className="text-xs text-ink-faint dark:text-slate-500">speaking confidence</p>
          </div>
        </div>

        {/* XP + streak */}
        <div className="mb-4 rounded-xl bg-slate-50 dark:bg-slate-800 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold ${level.colorClass}`}>
              Lv {level.level} · {level.title}
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-1 text-xs font-bold text-orange-500 dark:text-orange-400">
                <Flame className="h-3.5 w-3.5" />{streak}d streak
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-brand-500 shrink-0" />
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-1.5 rounded-full bg-gradient-to-r ${level.barColor} transition-all duration-700`}
                style={{ width: `${Math.round(prog * 100)}%` }}
              />
            </div>
            <span className="text-xs tabular-nums text-slate-400 dark:text-slate-500">{xp} XP</span>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const Icon = ICONS[item.key]
            const active = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300'
                    : 'text-ink-soft hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="mt-2 space-y-0.5 border-t border-slate-100 dark:border-slate-700/60 pt-2">
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile ── */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:bg-slate-900/90 dark:border-slate-700/50 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-extrabold text-ink dark:text-slate-100">{APP_NAME}</span>
            </div>
            <div className="flex items-center gap-1.5">
              {streak > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-1 text-xs font-bold text-orange-500">
                  <Flame className="h-3.5 w-3.5" />{streak}
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full bg-brand-500/10 px-2 py-1 text-xs font-bold text-brand-600 dark:text-brand-400">
                <Zap className="h-3.5 w-3.5" />{xp}
              </span>
              <button onClick={toggle} className="rounded-lg p-1.5 text-ink-faint hover:text-ink dark:text-slate-500 dark:hover:text-slate-200" aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button onClick={signOut} className="rounded-lg p-1.5 text-ink-faint hover:text-ink dark:text-slate-500 dark:hover:text-slate-200" aria-label="Sign out">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
            {NAV.map(item => {
              const Icon = ICONS[item.key]
              const active = view === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => go(item.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                </button>
              )
            })}
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-6">
          <h1 className="sr-only">{title}</h1>
          <div key={view} className="animate-fade-in">
            <Suspense fallback={<Spinner label="Loading…" />}>{screen()}</Suspense>
          </div>
        </main>

        <footer className="px-4 pb-8 pt-2 text-center text-xs text-ink-faint dark:text-slate-600">
          {APP_NAME} is a self-help companion, not a substitute for a speech-language pathologist or therapist.
        </footer>
      </div>
    </div>
  )
}
