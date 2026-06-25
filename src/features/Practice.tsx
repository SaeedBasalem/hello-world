import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, RotateCcw, Check, ChevronLeft, Zap, Play, TimerReset } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { SectionTitle } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ─── Data ─────────────────────────────────────────────────────────────────────

interface Drill {
  id: string
  title: string
  icon: string
  description: string
  tip: string
  words: string[]
  xp: number
  difficulty: 'Easy' | 'Medium'
}

const DRILLS: Drill[] = [
  {
    id: 'vowel-launcher',
    title: 'Vowel Launcher',
    icon: '🚀',
    description: 'Every word here starts with a vowel — the easiest possible onset',
    tip: 'Open your mouth gently before the word comes. Vowels love a soft, open start with no buildup.',
    words: ['always', 'open', 'easy', 'absolutely', 'actually', 'alright', 'often', 'every'],
    xp: 10,
    difficulty: 'Easy',
  },
  {
    id: 'gentle-onset',
    title: 'Gentle Onset',
    icon: '🌊',
    description: 'Let a tiny puff of air flow first — then let the word ride on it',
    tip: 'Breathe out a little before speaking. The word floats on that air. No pushing, no forcing.',
    words: ['slow', 'soft', 'fine', 'warm', 'flow', 'clear', 'free', 'light'],
    xp: 15,
    difficulty: 'Easy',
  },
  {
    id: 'bounce-start',
    title: 'Bounce Start',
    icon: '🎵',
    description: 'Stutter deliberately — when you choose it, it loses its power',
    tip: 'b-b-bounce. p-p-please. Say the first sound 2–3 times on purpose, then complete the word.',
    words: ['b-b-bread', 'p-p-please', 't-t-today', 'm-m-morning', 's-s-sorry', 'g-g-great'],
    xp: 20,
    difficulty: 'Medium',
  },
  {
    id: 'momentum',
    title: 'Momentum Builder',
    icon: '🏃',
    description: 'Chain easy words to carry you into the harder ones',
    tip: 'Say "and... and... and" before each phrase to get flow going first. Momentum is your friend.',
    words: ["and I'd like", "so my name is", "well I was thinking", "I mean I really want", "and actually"],
    xp: 20,
    difficulty: 'Medium',
  },
]

interface Scenario {
  id: string
  title: string
  icon: string
  difficulty: string
  tip: string
  lines: { speaker: 'them' | 'you'; text: string }[]
  xp: number
}

const SCENARIOS: Scenario[] = [
  {
    id: 'coffee',
    title: 'Ordering Coffee',
    icon: '☕',
    difficulty: 'Beginner',
    tip: 'Start with "I\'d" — it starts with a vowel. Easy onset right from the first word.',
    lines: [
      { speaker: 'them', text: 'Hi! What can I get started for you today?' },
      { speaker: 'you',  text: "I'd like a [your order], please." },
      { speaker: 'them', text: 'Great! What size would you like?' },
      { speaker: 'you',  text: 'A medium, please.' },
      { speaker: 'them', text: 'Can I get a name for the order?' },
      { speaker: 'you',  text: '[Your name].' },
      { speaker: 'them', text: "Perfect — that'll be right up!" },
      { speaker: 'you',  text: 'Thank you.' },
    ],
    xp: 30,
  },
  {
    id: 'phone',
    title: 'Phone Call',
    icon: '📞',
    difficulty: 'Intermediate',
    tip: "Phone calls are harder — no face to see. Start with 'Hi' and breathe before the main sentence.",
    lines: [
      { speaker: 'them', text: 'Hello, thank you for calling. How can I help?' },
      { speaker: 'you',  text: "Hi! I'm calling to ask what your opening hours are." },
      { speaker: 'them', text: 'Sure! We\'re open Monday to Friday, 9 to 5.' },
      { speaker: 'you',  text: 'And are you open on weekends?' },
      { speaker: 'them', text: "We're open Saturdays from 10 to 3, closed Sundays." },
      { speaker: 'you',  text: 'Perfect, thank you so much.' },
      { speaker: 'them', text: 'Anytime! Have a great day.' },
      { speaker: 'you',  text: 'You too, bye.' },
    ],
    xp: 35,
  },
  {
    id: 'intro',
    title: 'Meeting Someone New',
    icon: '🤝',
    difficulty: 'Intermediate',
    tip: 'If your name blocks you, try gentle onset: breathe first, then say it softly on that breath.',
    lines: [
      { speaker: 'them', text: "Hey! I don't think we've met. I'm [Name]." },
      { speaker: 'you',  text: "Hi! I'm [Your name]. Nice to meet you." },
      { speaker: 'them', text: 'What brings you here today?' },
      { speaker: 'you',  text: "I'm here for the [event/reason]. You?" },
      { speaker: 'them', text: "Same! What do you do for work?" },
      { speaker: 'you',  text: "I work in [your field]. How about you?" },
      { speaker: 'them', text: "That's cool! How long have you been doing that?" },
      { speaker: 'you',  text: 'About [X] years now. I really enjoy it.' },
    ],
    xp: 30,
  },
  {
    id: 'doctor',
    title: "Doctor's Appointment",
    icon: '🏥',
    difficulty: 'Advanced',
    tip: 'Doctors are trained to be patient. Take your time — there is no rush here.',
    lines: [
      { speaker: 'them', text: 'Good morning! What brings you in today?' },
      { speaker: 'you',  text: "I've been having some [describe symptom] for a few days." },
      { speaker: 'them', text: 'I see. Can you describe exactly how it feels?' },
      { speaker: 'you',  text: "It feels like [describe]. It's worse in the [morning/evening]." },
      { speaker: 'them', text: 'Have you taken anything for it?' },
      { speaker: 'you',  text: "I tried [medication] but it didn't really help." },
      { speaker: 'them', text: 'Any allergies I should know about before I suggest anything?' },
      { speaker: 'you',  text: 'No known allergies.' },
    ],
    xp: 40,
  },
]

interface Prompt {
  id: string
  text: string
  seconds: number
}

const PROMPTS: Prompt[] = [
  { id: 'morning',  text: 'Describe how your morning went — from waking up to right now.',             seconds: 60  },
  { id: 'meal',     text: "Tell me about your favourite meal. What makes it special?",                 seconds: 60  },
  { id: 'week',     text: "What are you most looking forward to this week? Why?",                      seconds: 60  },
  { id: 'place',    text: "Describe your bedroom or living room as if to someone who's never seen it.",seconds: 90  },
  { id: 'skill',    text: "What's a skill you've been wanting to learn? Why that one?",                seconds: 90  },
  { id: 'weekend',  text: 'Tell me about something you did last weekend.',                              seconds: 60  },
  { id: 'opinion',  text: "What's something most people disagree with you on? Why do you hold that view?", seconds: 120 },
  { id: 'win',      text: 'Describe a moment this week where you felt proud of yourself.',             seconds: 60  },
]

// ─── Main component ────────────────────────────────────────────────────────────

export default function Practice() {
  const [tab, setTab] = useState<'drills' | 'scenarios' | 'prompts'>('drills')
  const { awardXp } = useProfile()
  const { user } = useAuth()

  const logSession = useCallback(async (type: string, ref: string, xp: number) => {
    if (!user) return
    await supabase.from('sc_practice_sessions').insert({
      user_id: user.id, session_type: type, session_ref: ref, xp_earned: xp,
    })
    await awardXp(xp)
  }, [user, awardXp])

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Speaking Practice"
        subtitle="Deliberate reps build confidence — one word at a time"
      />

      <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
        {(['drills', 'scenarios', 'prompts'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold capitalize transition ${
              tab === t
                ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                : 'text-ink-soft dark:text-slate-400 hover:text-ink dark:hover:text-slate-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'drills'    && <DrillsTab onComplete={logSession} />}
      {tab === 'scenarios' && <ScenariosTab onComplete={logSession} />}
      {tab === 'prompts'   && <PromptsTab onComplete={logSession} />}
    </div>
  )
}

// ─── Drills tab ────────────────────────────────────────────────────────────────

function DrillsTab({ onComplete }: { onComplete: (type: string, ref: string, xp: number) => void }) {
  const [selected, setSelected] = useState<Drill | null>(null)
  const [wordIdx, setWordIdx] = useState(0)
  const [phase, setPhase] = useState<'idle' | 'countdown' | 'speaking' | 'done'>('idle')
  const [countdown, setCountdown] = useState(3)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [xpFlash, setXpFlash] = useState(false)

  const startDrill = (drill: Drill) => {
    setSelected(drill)
    setWordIdx(0)
    setPhase('idle')
  }

  const beginWord = () => {
    setCountdown(3)
    setPhase('countdown')
  }

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) { setPhase('speaking'); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 800)
    return () => clearTimeout(t)
  }, [phase, countdown])

  const nextWord = () => {
    if (!selected) return
    if (wordIdx + 1 >= selected.words.length) {
      setPhase('done')
      if (!completed.has(selected.id)) {
        setCompleted(prev => new Set([...prev, selected.id]))
        setXpFlash(true)
        setTimeout(() => setXpFlash(false), 2000)
        onComplete('drill', selected.id, selected.xp)
      }
    } else {
      setWordIdx(i => i + 1)
      setPhase('idle')
    }
  }

  if (selected) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-1.5 text-sm text-ink-soft dark:text-slate-400 hover:text-ink dark:hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4" /> Back to drills
        </button>

        <div className="card p-5">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <h3 className="font-bold text-ink dark:text-slate-100">{selected.title}</h3>
              <p className="text-xs text-ink-faint dark:text-slate-500">
                Word {wordIdx + 1} of {selected.words.length}
              </p>
            </div>
          </div>

          <div className="mb-4 rounded-xl bg-brand-50 dark:bg-brand-900/20 p-3 text-sm text-brand-700 dark:text-brand-300">
            💡 {selected.tip}
          </div>

          {phase === 'done' ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className={`flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 ${xpFlash ? 'animate-pop' : ''}`}>
                <Check className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-bold text-ink dark:text-slate-100">Drill complete!</p>
              {xpFlash && (
                <p className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold animate-xp-float">
                  <Zap className="h-4 w-4" /> +{selected.xp} XP
                </p>
              )}
              <button className="btn-primary mt-2" onClick={() => { setWordIdx(0); setPhase('idle') }}>
                <RotateCcw className="h-4 w-4" /> Run it again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 py-4">
              {phase === 'idle' && (
                <>
                  <p className="text-lg font-bold text-ink-soft dark:text-slate-400">Get ready…</p>
                  <button className="btn-primary px-8 py-3 text-base" onClick={beginWord}>
                    <Play className="h-5 w-5" /> Start word
                  </button>
                </>
              )}

              {phase === 'countdown' && (
                <div className="flex flex-col items-center gap-2">
                  <p className="text-sm text-ink-soft dark:text-slate-400">Breathe in…</p>
                  <p className="text-7xl font-black text-brand-600 dark:text-brand-400 tabular-nums animate-pulse">
                    {countdown === 0 ? 'Go!' : countdown}
                  </p>
                </div>
              )}

              {phase === 'speaking' && (
                <div className="flex flex-col items-center gap-5">
                  <p className="text-sm text-ink-soft dark:text-slate-400">Say it now:</p>
                  <p className="text-4xl font-extrabold text-ink dark:text-slate-50 tracking-wide text-center px-4">
                    {selected.words[wordIdx]}
                  </p>
                  <button className="btn-primary px-8" onClick={nextWord}>
                    <Check className="h-4 w-4" />
                    {wordIdx + 1 >= selected.words.length ? 'Finish' : 'Next word'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-4 flex gap-1">
            {selected.words.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  i < wordIdx || phase === 'done'
                    ? 'bg-brand-500'
                    : i === wordIdx && phase !== 'idle'
                      ? 'bg-brand-300 dark:bg-brand-600'
                      : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-sm text-ink-soft dark:text-slate-400">
        Initiation drills target the hardest moment — the first word. Tap a drill to start.
      </p>
      {DRILLS.map(drill => (
        <button
          key={drill.id}
          onClick={() => startDrill(drill)}
          className={`w-full text-left card p-4 transition hover:shadow-md dark:hover:shadow-slate-900/60 flex items-center gap-4 ${
            completed.has(drill.id) ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-900/10' : ''
          }`}
        >
          <span className="text-3xl">{drill.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-ink dark:text-slate-100">{drill.title}</p>
              <span className={`chip text-xs ${
                drill.difficulty === 'Easy'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
              }`}>
                {drill.difficulty}
              </span>
              {completed.has(drill.id) && <Check className="h-4 w-4 text-emerald-500" />}
            </div>
            <p className="text-sm text-ink-soft dark:text-slate-400 truncate">{drill.description}</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-brand-600 dark:text-brand-400">+{drill.xp} XP</span>
        </button>
      ))}
    </div>
  )
}

// ─── Scenarios tab ─────────────────────────────────────────────────────────────

function ScenariosTab({ onComplete }: { onComplete: (type: string, ref: string, xp: number) => void }) {
  const [selected, setSelected] = useState<Scenario | null>(null)
  const [doneLines, setDoneLines] = useState<Set<number>>(new Set())
  const [finished, setFinished] = useState(false)
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [xpFlash, setXpFlash] = useState(false)

  const yourLines = selected ? selected.lines.map((l, i) => l.speaker === 'you' ? i : -1).filter(i => i >= 0) : []
  const allDone = finished || (yourLines.length > 0 && yourLines.every(i => doneLines.has(i)))

  const markLine = (i: number) => {
    const next = new Set([...doneLines, i])
    setDoneLines(next)
    if (selected && yourLines.every(idx => next.has(idx))) {
      setFinished(true)
      if (!completed.has(selected.id)) {
        setCompleted(prev => new Set([...prev, selected.id]))
        setXpFlash(true)
        setTimeout(() => setXpFlash(false), 2000)
        onComplete('scenario', selected.id, selected.xp)
      }
    }
  }

  if (selected) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={() => { setSelected(null); setDoneLines(new Set()); setFinished(false) }}
          className="flex items-center gap-1.5 text-sm text-ink-soft dark:text-slate-400 hover:text-ink dark:hover:text-slate-200"
        >
          <ChevronLeft className="h-4 w-4" /> Back to scenarios
        </button>

        <div className="card p-5 space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selected.icon}</span>
            <div>
              <h3 className="font-bold text-ink dark:text-slate-100">{selected.title}</h3>
              <p className="text-xs text-ink-faint dark:text-slate-500">{selected.difficulty} · +{selected.xp} XP on completion</p>
            </div>
          </div>

          <div className="rounded-xl bg-brand-50 dark:bg-brand-900/20 p-3 text-sm text-brand-700 dark:text-brand-300">
            💡 {selected.tip}
          </div>

          <div className="space-y-2">
            {selected.lines.map((line, i) => (
              <div key={i} className={`flex gap-3 ${line.speaker === 'you' ? 'justify-end' : 'justify-start'}`}>
                {line.speaker === 'them' && (
                  <div className="max-w-[75%] rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-700 px-4 py-2.5">
                    <p className="text-xs text-ink-faint dark:text-slate-500 mb-1">Them</p>
                    <p className="text-sm text-ink dark:text-slate-200">{line.text}</p>
                  </div>
                )}
                {line.speaker === 'you' && (
                  <button
                    onClick={() => markLine(i)}
                    className={`max-w-[75%] rounded-2xl rounded-tr-sm px-4 py-2.5 text-left transition ${
                      doneLines.has(i)
                        ? 'bg-brand-500 text-white opacity-70'
                        : 'bg-brand-600 text-white hover:bg-brand-700 ring-2 ring-brand-300 dark:ring-brand-700 animate-pulse-ring'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs opacity-80">You — tap when said</p>
                      {doneLines.has(i) && <Check className="h-3.5 w-3.5" />}
                    </div>
                    <p className="text-sm font-medium">{line.text}</p>
                  </button>
                )}
              </div>
            ))}
          </div>

          {allDone && (
            <div className="flex flex-col items-center gap-2 py-3 text-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 ${xpFlash ? 'animate-pop' : ''}`}>
                <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-bold text-ink dark:text-slate-100">Scenario complete!</p>
              {xpFlash && (
                <p className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold text-sm animate-xp-float">
                  <Zap className="h-3.5 w-3.5" /> +{selected.xp} XP earned
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 animate-fade-in">
      <p className="text-sm text-ink-soft dark:text-slate-400">
        Real-world scripts — read through the scenario, tap each of your lines as you say them.
      </p>
      {SCENARIOS.map(s => (
        <button
          key={s.id}
          onClick={() => { setSelected(s); setDoneLines(new Set()); setFinished(false) }}
          className={`w-full text-left card p-4 transition hover:shadow-md dark:hover:shadow-slate-900/60 flex items-center gap-4 ${
            completed.has(s.id) ? 'border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-900/10' : ''
          }`}
        >
          <span className="text-3xl">{s.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-ink dark:text-slate-100">{s.title}</p>
              <span className="chip text-xs bg-slate-100 text-ink-soft dark:bg-slate-700 dark:text-slate-400">{s.difficulty}</span>
              {completed.has(s.id) && <Check className="h-4 w-4 text-emerald-500" />}
            </div>
            <p className="text-xs text-ink-faint dark:text-slate-500 mt-0.5">{s.lines.filter(l => l.speaker === 'you').length} lines for you to say</p>
          </div>
          <span className="shrink-0 text-xs font-bold text-brand-600 dark:text-brand-400">+{s.xp} XP</span>
        </button>
      ))}
    </div>
  )
}

// ─── Prompts tab ───────────────────────────────────────────────────────────────

function PromptsTab({ onComplete }: { onComplete: (type: string, ref: string, xp: number) => void }) {
  const [prompt] = useState(() => PROMPTS[Math.floor(Date.now() / 86400000) % PROMPTS.length])
  const [status, setStatus] = useState<'idle' | 'recording' | 'done'>('idle')
  const [elapsed, setElapsed] = useState(0)
  const [xpFlash, setXpFlash] = useState(false)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<BlobPart[]>([])
  const timerRef = useRef<number | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)

  const pct = Math.min(elapsed / prompt.seconds, 1)
  const remaining = Math.max(prompt.seconds - elapsed, 0)
  const mmss = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`

  useEffect(() => {
    if (status !== 'recording') return
    timerRef.current = window.setInterval(() => {
      setElapsed(e => {
        if (e + 1 >= prompt.seconds) {
          stopSession(true)
          return e + 1
        }
        return e + 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [status])

  const startSession = async () => {
    setElapsed(0)
    setAudioUrl(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(t => t.stop())
      }
      mr.start()
      mediaRef.current = mr
    } catch {
      // mic not available — still run the timer
    }
    setStatus('recording')
  }

  const stopSession = (autoFinished = false) => {
    if (timerRef.current) clearInterval(timerRef.current)
    mediaRef.current?.stop()
    setStatus('done')
    setXpFlash(true)
    setTimeout(() => setXpFlash(false), 2000)
    onComplete('prompt', prompt.id, 20)
    if (!autoFinished) setElapsed(prompt.seconds)
  }

  const reset = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(null)
    setElapsed(0)
    setStatus('idle')
  }

  const circumference = 2 * Math.PI * 44

  return (
    <div className="space-y-4 animate-fade-in">
      <p className="text-sm text-ink-soft dark:text-slate-400">
        Speak freely for the full time. Record yourself or just talk — it all counts.
      </p>

      <div className="card p-6 space-y-5">
        <div className="rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 dark:from-brand-700 dark:to-brand-900 p-5 text-white">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-200 mb-2">Today's prompt</p>
          <p className="text-lg font-semibold leading-snug">{prompt.text}</p>
          <p className="mt-2 text-xs text-brand-300">{prompt.seconds}s challenge · +20 XP</p>
        </div>

        <div className="flex flex-col items-center gap-5">
          <div className="relative">
            <svg width="100" height="100" className="-rotate-90">
              <circle cx="50" cy="50" r="44" stroke="#e2e8f0" strokeWidth="6" fill="none" className="dark:stroke-slate-700" />
              <circle
                cx="50" cy="50" r="44"
                stroke="currentColor"
                className={`transition-all duration-1000 ${status === 'done' ? 'text-emerald-500' : 'text-brand-500'}`}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference * (1 - pct)}
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold tabular-nums text-ink dark:text-slate-100">{mmss}</span>
            </div>
          </div>

          {status === 'idle' && (
            <button className="btn-primary px-8 py-3" onClick={startSession}>
              <Mic className="h-5 w-5" /> Start speaking
            </button>
          )}
          {status === 'recording' && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-ink-soft dark:text-slate-400">Recording…</span>
              </div>
              <button className="btn bg-red-500 text-white hover:bg-red-600" onClick={() => stopSession()}>
                <Square className="h-4 w-4" /> Finish early
              </button>
            </div>
          )}
          {status === 'done' && (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 ${xpFlash ? 'animate-pop' : ''}`}>
                <Check className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="font-bold text-ink dark:text-slate-100">Nice work!</p>
              {xpFlash && (
                <p className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold text-sm animate-xp-float">
                  <Zap className="h-3.5 w-3.5" /> +20 XP
                </p>
              )}
              {audioUrl && (
                <div className="w-full">
                  <p className="text-xs text-ink-faint dark:text-slate-500 mb-1.5">Listen back — just notice, no grading.</p>
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}
              <button className="btn-ghost" onClick={reset}>
                <TimerReset className="h-4 w-4" /> Try a different prompt
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
