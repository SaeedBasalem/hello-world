import { useEffect, useState } from 'react'
import { Trophy, RefreshCw, Trash2, ChevronDown, Repeat } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { SwapEvent } from '../lib/types'
import { todayStr, addDays, prettyDate } from '../lib/dates'
import { Card, SectionTitle, Spinner } from '../components/ui'

export default function SwapTracker() {
  const { user } = useAuth()
  const [events, setEvents] = useState<SwapEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [word, setWord] = useState('')
  const [situation, setSituation] = useState('')

  const since = addDays(todayStr(), -13)

  const load = async () => {
    if (!user) return
    const { data } = await supabase
      .from('sc_swap_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('day', since)
      .order('created_at', { ascending: false })
    setEvents((data as SwapEvent[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const log = async (saidAnyway: boolean) => {
    if (!user) return
    const optimistic: SwapEvent = {
      id: `tmp-${Date.now()}`,
      user_id: user.id,
      day: todayStr(),
      said_anyway: saidAnyway,
      word: word.trim() || null,
      situation: situation.trim() || null,
      created_at: new Date().toISOString(),
    }
    setEvents([optimistic, ...events])
    setWord('')
    setSituation('')
    const { data } = await supabase
      .from('sc_swap_events')
      .insert({
        user_id: user.id,
        said_anyway: saidAnyway,
        word: optimistic.word,
        situation: optimistic.situation,
      })
      .select('*')
      .single()
    if (data) setEvents((prev) => [data as SwapEvent, ...prev.filter((e) => e.id !== optimistic.id)])
  }

  const remove = async (id: string) => {
    setEvents(events.filter((e) => e.id !== id))
    if (!id.startsWith('tmp-')) await supabase.from('sc_swap_events').delete().eq('id', id)
  }

  if (loading) return <Spinner label="Loading…" />

  const today = todayStr()
  const todays = events.filter((e) => e.day === today)
  const todayWins = todays.filter((e) => e.said_anyway).length
  const todaySwaps = todays.filter((e) => !e.said_anyway).length
  const weekWins = events.filter((e) => e.said_anyway).length
  const weekSwaps = events.filter((e) => !e.said_anyway).length

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          title="The word-swap lever"
          subtitle="Swapping feels safe, but it quietly keeps the fear alive. When you feel the urge, say the original word anyway — gently. A stutter on the real word is a win."
          icon={<Repeat className="h-5 w-5" />}
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => log(true)}
            className="group flex flex-col items-center gap-1 rounded-2xl bg-emerald-500 p-5 text-white transition hover:bg-emerald-600 active:scale-[0.98]"
          >
            <Trophy className="h-7 w-7" />
            <span className="text-base font-bold">I said it anyway</span>
            <span className="text-xs text-emerald-50">Real word, even if bumpy — a win</span>
          </button>
          <button
            onClick={() => log(false)}
            className="group flex flex-col items-center gap-1 rounded-2xl bg-slate-100 p-5 text-ink-soft transition hover:bg-slate-200 active:scale-[0.98]"
          >
            <RefreshCw className="h-7 w-7" />
            <span className="text-base font-bold">I swapped it</span>
            <span className="text-xs text-ink-faint">No judgment — just noticing</span>
          </button>
        </div>

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-ink-faint hover:text-ink-soft"
        >
          <ChevronDown className={`h-4 w-4 transition ${showDetails ? 'rotate-180' : ''}`} /> Add the word or
          situation (optional)
        </button>
        {showDetails && (
          <div className="mt-2 grid animate-fade-in gap-2 sm:grid-cols-2">
            <input className="field" placeholder="The word" value={word} onChange={(e) => setWord(e.target.value)} />
            <input
              className="field"
              placeholder="Situation"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            />
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Today</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{todayWins} <span className="text-base font-semibold text-ink-soft">said anyway</span></p>
          <p className="text-sm text-ink-faint">{todaySwaps} swapped</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Last 14 days</p>
          <p className="mt-1 text-2xl font-extrabold text-emerald-600">{weekWins} <span className="text-base font-semibold text-ink-soft">wins</span></p>
          <p className="text-sm text-ink-faint">{weekSwaps} swaps · watch this fall</p>
        </Card>
      </div>

      {todayWins > 0 && (
        <p className="rounded-xl bg-emerald-50 px-4 py-3 text-center text-sm font-medium text-emerald-800">
          {todayWins} time{todayWins > 1 ? 's' : ''} you let the real word out today. That’s the fear losing
          its grip. 💪
        </p>
      )}

      {events.length > 0 && (
        <Card>
          <SectionTitle title="Recent" />
          <ul className="space-y-1.5">
            {events.slice(0, 15).map((e) => (
              <li
                key={e.id}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ring-slate-100"
              >
                <span
                  className={`chip ${e.said_anyway ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-ink-soft'}`}
                >
                  {e.said_anyway ? 'said anyway' : 'swapped'}
                </span>
                <span className="text-ink-faint">{prettyDate(e.day)}</span>
                <span className="min-w-0 flex-1 truncate text-ink-soft">
                  {e.word && <span className="font-medium text-ink">“{e.word}”</span>}
                  {e.situation && <span> · {e.situation}</span>}
                </span>
                <button onClick={() => remove(e.id)} className="text-ink-faint hover:text-red-500" aria-label="Delete">
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
