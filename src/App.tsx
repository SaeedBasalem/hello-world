import { lazy, Suspense, useState } from 'react'
import {
  Home,
  CalendarCheck,
  Wind,
  TrendingUp,
  Repeat,
  Brain,
  NotebookPen,
  BarChart3,
  Compass,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { useAuth } from './context/AuthContext'
import { ProfileProvider, useProfile } from './context/ProfileContext'
import { NAV, type View } from './lib/nav'
import { APP_NAME } from './lib/content'
import { Spinner } from './components/ui'

import AuthScreen from './components/AuthScreen'
import Onboarding from './features/Onboarding'

// Feature screens are code-split so the first paint stays light (the charts
// library in Progress, in particular, only loads when that screen is opened).
const Dashboard = lazy(() => import('./features/Dashboard'))
const DailyRoutine = lazy(() => import('./features/DailyRoutine'))
const Calm = lazy(() => import('./features/Calm'))
const Ladder = lazy(() => import('./features/Ladder'))
const SwapTracker = lazy(() => import('./features/SwapTracker'))
const Reframe = lazy(() => import('./features/Reframe'))
const Journal = lazy(() => import('./features/Journal'))
const Progress = lazy(() => import('./features/Progress'))
const PlanReference = lazy(() => import('./features/PlanReference'))

const ICONS: Record<View, React.ComponentType<{ className?: string }>> = {
  dashboard: Home,
  routine: CalendarCheck,
  calm: Wind,
  ladder: TrendingUp,
  swaps: Repeat,
  reframe: Brain,
  journal: NotebookPen,
  progress: BarChart3,
  plan: Compass,
}

export default function App() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
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
  const [view, setView] = useState<View>('dashboard')

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Getting things ready…" />
      </div>
    )
  }

  if (profile && !profile.onboarded) return <Onboarding />

  const go = (v: View) => {
    setView(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const screen = () => {
    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={go} />
      case 'routine':
        return <DailyRoutine onNavigate={go} />
      case 'calm':
        return <Calm />
      case 'ladder':
        return <Ladder />
      case 'swaps':
        return <SwapTracker />
      case 'reframe':
        return <Reframe />
      case 'journal':
        return <Journal />
      case 'progress':
        return <Progress />
      case 'plan':
        return <PlanReference />
    }
  }

  const title = NAV.find((n) => n.key === view)?.label ?? APP_NAME

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-2 pt-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <p className="font-extrabold leading-none text-ink">{APP_NAME}</p>
            <p className="text-xs text-ink-faint">speaking confidence</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map((item) => {
            const Icon = ICONS[item.key]
            const active = view === item.key
            return (
              <button
                key={item.key}
                onClick={() => go(item.key)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-ink-soft hover:bg-slate-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </button>
            )
          })}
        </nav>
        <button onClick={signOut} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink-soft hover:bg-slate-50">
          <LogOut className="h-5 w-5" /> Sign out
        </button>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header + tabs */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-extrabold text-ink">{APP_NAME}</span>
            </div>
            <button onClick={signOut} className="text-ink-faint hover:text-ink" aria-label="Sign out">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <div className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-2">
            {NAV.map((item) => {
              const Icon = ICONS[item.key]
              const active = view === item.key
              return (
                <button
                  key={item.key}
                  onClick={() => go(item.key)}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {item.label}
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

        <footer className="px-4 pb-8 pt-2 text-center text-xs text-ink-faint">
          {APP_NAME} is a self-help companion, not a substitute for a speech-language pathologist or therapist.
        </footer>
      </div>
    </div>
  )
}
