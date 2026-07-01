import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Bot, ChevronLeft, Zap, Loader2, Volume2, VolumeX, AlertCircle } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { SectionTitle } from '../components/ui'

// ── Scripted scenario data ──────────────────────────────────────────────────

interface ScenarioScript {
  id: string
  title: string
  icon: string
  difficulty: string
  description: string
  opener: string
  turns: string[][] // turns[i] = possible coach replies for user turn i
  feedback: string
}

const SCRIPTS: ScenarioScript[] = [
  {
    id: 'coffee',
    title: 'Coffee Shop',
    icon: '☕',
    difficulty: 'Beginner',
    description: 'Order your favourite drink from a friendly barista',
    opener: "Hi! Welcome in — what can I get started for you today?",
    turns: [
      [
        "Great choice! What size would you like — small, medium, or large?",
        "Lovely! Would you like oat milk, almond milk, or regular?",
        "Excellent! Is that for here or to take away?",
      ],
      [
        "Perfect! Anything else I can get for you?",
        "Coming right up! Would you like a pastry with that?",
        "Great! Can I grab a name for the order?",
      ],
      [
        "That'll be £3.80 please — card or cash?",
        "Brilliant! Just give me one moment.",
        "Lovely, that's £4.20 all together — would you like a receipt?",
      ],
      [
        "Thank you! Your drink will be ready at the end of the counter in just a couple of minutes.",
        "Enjoy your coffee! Have a wonderful day.",
        "Perfect — see you next time! Hope you enjoy it.",
      ],
    ],
    feedback:
      "Well done! You placed your order and kept the conversation going — and that is the hardest part. Starting that very first sentence takes courage, and you did it. Each time you practise a scenario like this, that initial moment of speaking feels a little less daunting. Keep going!",
  },
  {
    id: 'shop',
    title: 'Asking for Help',
    icon: '🛍️',
    difficulty: 'Beginner',
    description: 'Ask a shop assistant where to find something',
    opener: "Hi there! Can I help you find something today?",
    turns: [
      [
        "Of course! What kind of thing are you looking for?",
        "Sure! Do you have a specific item or brand in mind?",
        "Absolutely — what section were you thinking?",
      ],
      [
        "Ah yes, those are just down the third aisle on your left — about halfway along.",
        "Oh, lovely choice! We have a whole section for that. Follow me and I'll show you.",
        "Yes, we definitely have those in stock — they're at the back of the store on the right.",
      ],
      [
        "Let me know if you need any other recommendations!",
        "Is there anything else I can help you with today?",
        "We also have some great deals near the entrance if you're interested!",
      ],
      [
        "Happy shopping! Enjoy your visit.",
        "Hope you find exactly what you're looking for!",
        "Feel free to come back if you need anything else — happy to help.",
      ],
    ],
    feedback:
      "Asking for help takes confidence — many people avoid it just to skip the conversation. But you asked clearly and got what you needed. In real life most shop assistants are happy to help and will respond warmly, just like today. Remember that people aren't focused on how you speak — they're focused on helping you.",
  },
  {
    id: 'phone',
    title: 'Phone Call',
    icon: '📞',
    difficulty: 'Intermediate',
    description: 'Call to ask about opening hours — no face, just voice',
    opener: "Hello, thanks for calling. How can I help you?",
    turns: [
      [
        "Of course! We're open Monday to Saturday, 9am to 6pm, and Sundays 10am to 4pm.",
        "Happy to help! Weekdays we're open 9 until 6, and weekends 10 to 4.",
        "Sure! We're open 9 to 6 on weekdays and 10 to 4 on weekends.",
      ],
      [
        "Yes, we're open on bank holidays — same hours as a Saturday.",
        "We are open on bank holidays, but with slightly reduced hours — 10am to 3pm.",
        "Bank holidays we open a little later at 10am and close at 3pm.",
      ],
      [
        "Is there anything else I can help you with today?",
        "Do you have any other questions at all?",
        "No problem at all — anything else I can do for you?",
      ],
      [
        "Great, thanks for calling! Have a wonderful day.",
        "Perfect — hope to see you soon. Take care!",
        "Lovely, thanks for getting in touch. Goodbye!",
      ],
    ],
    feedback:
      "Phone calls are one of the most challenging situations for anyone who stutters, because there are no visual cues and the silence feels very loud. You got through it — and that matters. The key thing to practise is staying calm when you feel the pressure build. Each call you complete makes the next one a little easier to start.",
  },
  {
    id: 'intro',
    title: 'New Introduction',
    icon: '🤝',
    difficulty: 'Intermediate',
    description: 'Meet someone for the first time and introduce yourself',
    opener: "Hey! I don't think we've met — I'm Alex. What's your name?",
    turns: [
      [
        "Nice to meet you! So what brings you here today?",
        "Great to meet you! Are you here for the event?",
        "Lovely to meet you! Do you know many people here?",
      ],
      [
        "Oh really? That sounds interesting! How long have you been doing that?",
        "Wow, that's great — what do you enjoy most about it?",
        "Oh that's cool! How did you get into that?",
      ],
      [
        "That's brilliant! And do you live nearby?",
        "Sounds like you keep busy — I love that!",
        "Wow, you've clearly found your thing. That's wonderful.",
      ],
      [
        "It was so lovely chatting with you — I hope we run into each other again!",
        "Really nice to meet you! Enjoy the rest of the event.",
        "Great talking to you! We should connect properly sometime.",
      ],
    ],
    feedback:
      "Introducing yourself to a stranger from scratch is genuinely hard — for everyone, not just people who stutter. You showed up, spoke, and kept the conversation going. That is exactly what builds confidence over time. The more you practise starting conversations, the less your brain will treat it as a threat.",
  },
  {
    id: 'doctor',
    title: 'Doctor Visit',
    icon: '🏥',
    difficulty: 'Advanced',
    description: 'Describe symptoms — practice speaking under gentle pressure',
    opener: "Good morning! Come on in and take a seat. What brings you in today?",
    turns: [
      [
        "I see. How long have you been feeling this way?",
        "Right, I understand. Can you tell me more about when it started?",
        "Okay. And when did you first notice this?",
      ],
      [
        "And would you say it's constant, or does it come and go?",
        "Is the discomfort there all the time, or does it ease up at certain points?",
        "Right. Would you say it's getting better, worse, or staying about the same?",
      ],
      [
        "Have you tried any medication or home remedies for it?",
        "Have you taken anything to help with it so far?",
        "Okay. And is it affecting your sleep or day-to-day activities?",
      ],
      [
        "Thank you — that gives me a very clear picture. Let me examine you and we'll figure out the best next step together.",
        "Right, that's very helpful. Let me take a look and then we'll discuss our options.",
        "Perfect, I think I have a good understanding now. I'll do a quick examination and we'll go from there.",
      ],
    ],
    feedback:
      "Describing your symptoms to a doctor requires clear, specific speech under a little pressure — and you handled it. In real appointments, doctors are trained to be patient listeners and will give you time to speak. Your health communication matters, and practising it like this is a genuinely important step. Well done for taking on the hardest scenario.",
  },
]

// ── Types ────────────────────────────────────────────────────────────────────

type VoiceMode = 'auto' | 'push'
type Phase = 'idle' | 'countdown' | 'listening' | 'processing'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AICoach() {
  const { awardXp } = useProfile()
  const [scenario, setScenario] = useState<ScenarioScript | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [xpFlash, setXpFlash] = useState(false)
  const [sessionDone, setSessionDone] = useState(false)
  const [voiceMode, setVoiceMode] = useState<VoiceMode>('auto')
  const [phase, setPhase] = useState<Phase>('idle')
  const [countdown, setCountdown] = useState(3)
  const [liveText, setLiveText] = useState('')
  const [micStatus, setMicStatus] = useState<'unknown' | 'granted' | 'denied'>('unknown')
  const [aiSpeaking, setAiSpeaking] = useState(false)
  const [muted, setMuted] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')

  // ── Refs ───────────────────────────────────────────────────────────────────
  const recognitionRef = useRef<any>(null)
  const finalTextRef = useRef('')
  const liveTextRef = useRef('')
  const silenceTimerRef = useRef<number | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<Phase>('idle')
  const messagesRef = useRef<Message[]>([])
  const scenarioRef = useRef<ScenarioScript | null>(null)
  const mutedRef = useRef(false)
  const voiceModeRef = useRef<VoiceMode>('auto')
  const sessionDoneRef = useRef(false)
  const loadingRef = useRef(false)
  const shouldRestartRef = useRef(false)
  const sendFnRef = useRef<(text: string) => void>()
  const sendCapturedRef = useRef<(text: string) => void>()

  const setPhaseSync = (p: Phase) => { phaseRef.current = p; setPhase(p) }

  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { voiceModeRef.current = voiceMode }, [voiceMode])
  useEffect(() => { messagesRef.current = messages }, [messages])
  useEffect(() => { sessionDoneRef.current = sessionDone }, [sessionDone])
  useEffect(() => { loadingRef.current = loading }, [loading])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, feedback, loading, liveText])

  useEffect(() => {
    return () => {
      shouldRestartRef.current = false
      recognitionRef.current?.abort()
      window.speechSynthesis?.cancel()
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    }
  }, [])

  // ── TTS ────────────────────────────────────────────────────────────────────

  const speakText = useCallback((text: string, afterSpoken?: () => void) => {
    const done = () => {
      setAiSpeaking(false)
      afterSpoken?.()
    }

    if (mutedRef.current || !window.speechSynthesis) { done(); return }

    window.speechSynthesis.cancel()
    setAiSpeaking(false)

    const doSpeak = () => {
      const utter = new SpeechSynthesisUtterance(text)
      utter.lang = 'en-US'
      utter.rate = 0.9
      const voices = window.speechSynthesis.getVoices()
      const voice =
        voices.find(v => v.lang.startsWith('en') && /natural|enhanced|premium/i.test(v.name)) ||
        voices.find(v => v.lang.startsWith('en') && /google|microsoft/i.test(v.name)) ||
        voices.find(v => v.lang === 'en-US') ||
        voices.find(v => v.lang.startsWith('en')) || null
      if (voice) utter.voice = voice
      utter.onstart = () => setAiSpeaking(true)
      utter.onend = done
      utter.onerror = done
      window.speechSynthesis.speak(utter)
    }

    if (window.speechSynthesis.getVoices().length) {
      doSpeak()
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        doSpeak()
      }
    }
  }, [])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel()
    setAiSpeaking(false)
  }, [])

  // ── Auto-start user turn after AI finishes speaking ────────────────────────

  const triggerAutoListen = useCallback(() => {
    if (voiceModeRef.current === 'auto') {
      setTimeout(() => { setCountdown(3); setPhaseSync('countdown') }, 700)
    }
  }, [])

  // ── Countdown ──────────────────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== 'countdown') return
    if (countdown === 0) { startNewRecognition(); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 900)
    return () => clearTimeout(t)
  }, [phase, countdown])

  // ── Speech recognition ─────────────────────────────────────────────────────

  const startNewRecognition = useCallback(() => {
    const w = window as any
    const SpeechRec = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRec || !shouldRestartRef.current) return

    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
      recognitionRef.current = null
    }
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }

    const rec = new SpeechRec()
    rec.continuous = true      // keep listening through pauses — critical for stuttering
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.lang = 'en-US'

    rec.onresult = (event: any) => {
      // Reset silence timer on every speech event
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)

      let final = '', interim = ''
      // Start from resultIndex — avoids duplicating previously finalized words
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript
        if (event.results[i].isFinal) final += t + ' '
        else interim += t
      }
      if (final) finalTextRef.current += final
      const combined = (finalTextRef.current + interim).trim()
      liveTextRef.current = combined
      setLiveText(combined)

      // 3 seconds of silence = user finished speaking
      // Longer than default to accommodate stuttering pauses and blocks
      silenceTimerRef.current = window.setTimeout(() => {
        if (phaseRef.current === 'listening' && finalTextRef.current.trim()) {
          sendCapturedRef.current?.(finalTextRef.current.trim())
        }
      }, 3000)
    }

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        shouldRestartRef.current = false
        setMicStatus('denied')
        setPhaseSync('idle')
      }
      // no-speech / aborted / network: onend will handle restart
    }

    rec.onend = () => {
      if (recognitionRef.current !== rec) return
      recognitionRef.current = null

      if (!shouldRestartRef.current) {
        // Intentional stop — send anything captured
        const captured = finalTextRef.current.trim()
        if (captured) sendCapturedRef.current?.(captured)
        return
      }

      if (phaseRef.current !== 'listening') return

      // Browser forcibly ended the continuous session — restart it
      setTimeout(() => {
        if (phaseRef.current === 'listening' && shouldRestartRef.current) {
          startNewRecognition()
        }
      }, 150)
    }

    try {
      rec.start()
      recognitionRef.current = rec
      setStatusMsg('Speak now…')
    } catch {
      setTimeout(() => {
        if (phaseRef.current === 'listening' && shouldRestartRef.current) startNewRecognition()
      }, 500)
    }
  }, [])

  const sendCaptured = useCallback((text: string) => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
    finalTextRef.current = ''
    liveTextRef.current = ''
    setLiveText('')
    setPhaseSync('processing')
    setStatusMsg('')
    setTimeout(() => {
      setPhaseSync('idle')
      sendFnRef.current?.(text)
    }, 150)
  }, [])

  useEffect(() => { sendCapturedRef.current = sendCaptured }, [sendCaptured])

  const beginListening = useCallback(() => {
    stopSpeaking()
    finalTextRef.current = ''
    liveTextRef.current = ''
    setLiveText('')
    shouldRestartRef.current = true
    setPhaseSync('listening')
    startNewRecognition()
  }, [stopSpeaking, startNewRecognition])

  const endListening = useCallback(() => {
    shouldRestartRef.current = false
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort() } catch {}
      recognitionRef.current = null
    }
    const captured = finalTextRef.current.trim() || liveTextRef.current.trim()
    if (captured) {
      sendCaptured(captured)
    } else {
      setPhaseSync('idle')
      setLiveText('')
      setStatusMsg('')
    }
  }, [sendCaptured])

  const handleMicClick = useCallback(() => {
    if (loadingRef.current) return
    if (phaseRef.current === 'listening') { endListening(); return }
    if (phaseRef.current === 'countdown') { setPhaseSync('idle'); return }
    if (phaseRef.current === 'idle') {
      stopSpeaking()
      if (voiceModeRef.current === 'auto') {
        setCountdown(3); setPhaseSync('countdown')
      } else {
        beginListening()
      }
    }
  }, [beginListening, endListening, stopSpeaking])

  // ── Scripted response engine ───────────────────────────────────────────────

  const processUserMessage = useCallback((text: string) => {
    const sc = scenarioRef.current
    if (!sc) return

    // Mark coach practice as done for today (read by Dashboard goals)
    localStorage.setItem('steady_coach_date', new Date().toISOString().slice(0, 10))

    const userTurnIndex = messagesRef.current.filter(m => m.role === 'user').length
    const withUser: Message[] = [...messagesRef.current, { role: 'user', content: text }]
    messagesRef.current = withUser
    setMessages(withUser)

    loadingRef.current = true
    setLoading(true)

    // Pick the scripted reply for this turn
    const turnBank = sc.turns[Math.min(userTurnIndex, sc.turns.length - 1)]
    const reply = turnBank[userTurnIndex % turnBank.length]

    // Simulate a brief "thinking" delay (0.8 – 1.4s)
    const delay = 800 + Math.floor((userTurnIndex * 137 + 42) % 600)

    setTimeout(() => {
      const withReply: Message[] = [...messagesRef.current, { role: 'assistant', content: reply }]
      messagesRef.current = withReply
      setMessages(withReply)
      loadingRef.current = false
      setLoading(false)
      speakText(reply, triggerAutoListen)
    }, delay)
  }, [speakText, triggerAutoListen])

  useEffect(() => { sendFnRef.current = processUserMessage }, [processUserMessage])

  // ── Feedback ───────────────────────────────────────────────────────────────

  const showFeedback = async () => {
    const sc = scenarioRef.current
    if (!sc || sessionDoneRef.current) return
    setFeedback(sc.feedback)
    speakText(sc.feedback) // read feedback aloud too
    setSessionDone(true)
    sessionDoneRef.current = true
    setXpFlash(true)
    setTimeout(() => setXpFlash(false), 2500)
    await awardXp(40)
  }

  // ── Mic permission check ───────────────────────────────────────────────────

  const checkMic = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach(t => t.stop())
      setMicStatus('granted')
      return true
    } catch {
      setMicStatus('denied')
      return false
    }
  }, [])

  // ── Start scenario ─────────────────────────────────────────────────────────

  const startScenario = async (sc: ScenarioScript) => {
    shouldRestartRef.current = false
    if (recognitionRef.current) { try { recognitionRef.current.abort() } catch {} recognitionRef.current = null }
    stopSpeaking()

    const ok = await checkMic()
    if (!ok) return

    const initial: Message[] = [{ role: 'assistant', content: sc.opener }]
    messagesRef.current = initial
    scenarioRef.current = sc

    setScenario(sc)
    setMessages(initial)
    setPhaseSync('idle')
    setLiveText('')
    setFeedback(null)
    setSessionDone(false)
    sessionDoneRef.current = false
    setXpFlash(false)
    finalTextRef.current = ''
    liveTextRef.current = ''

    setTimeout(() => speakText(sc.opener, triggerAutoListen), 300)
  }

  const userTurns = messages.filter(m => m.role === 'user').length
  const hasSpeechAPI = !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)

  // ── Scenario picker ────────────────────────────────────────────────────────

  if (!scenario) {
    return (
      <div className="space-y-5">
        <SectionTitle
          title="AI Coach"
          subtitle="Practice speaking out loud — the coach responds naturally and speaks back to you"
        />
        <p className="text-sm text-ink-soft dark:text-slate-400">
          Choose a scenario. The app will ask for microphone permission, then the conversation begins automatically.
        </p>

        {!hasSpeechAPI && (
          <div className="flex gap-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              Voice recognition requires Chrome or Edge on desktop.
            </p>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          {SCRIPTS.map(s => (
            <button
              key={s.id}
              onClick={() => startScenario(s)}
              className="text-left card p-4 transition hover:shadow-md dark:hover:shadow-slate-900/60 flex gap-3"
            >
              <span className="text-3xl">{s.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-bold text-ink dark:text-slate-100">{s.title}</p>
                  <span className={`chip text-xs ${
                    s.difficulty === 'Beginner'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : s.difficulty === 'Intermediate'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {s.difficulty}
                  </span>
                </div>
                <p className="text-sm text-ink-soft dark:text-slate-400 mt-0.5 leading-snug">{s.description}</p>
                <p className="text-xs text-brand-600 dark:text-brand-400 font-semibold mt-1">+40 XP on completion</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // ── Chat screen ────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col" style={{ minHeight: 'calc(100vh - 180px)' }}>

      {/* Header */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              shouldRestartRef.current = false
              if (recognitionRef.current) { try { recognitionRef.current.abort() } catch {} recognitionRef.current = null }
              stopSpeaking()
              setScenario(null)
              scenarioRef.current = null
              setPhaseSync('idle')
            }}
            className="flex items-center gap-1.5 text-sm text-ink-soft dark:text-slate-400 hover:text-ink dark:hover:text-slate-200"
          >
            <ChevronLeft className="h-4 w-4" /> Scenarios
          </button>
          <button
            onClick={() => {
              const next = !muted
              setMuted(next)
              mutedRef.current = next
              if (next) stopSpeaking()
            }}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-ink-soft dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {muted ? 'Unmute' : 'Mute'}
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 dark:from-brand-700 dark:to-brand-900 p-4 text-white">
          <span className="text-2xl">{scenario.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold">{scenario.title}</p>
            <p className="text-xs text-brand-200 truncate">{scenario.description}</p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">
            {aiSpeaking
              ? <><span className="flex gap-0.5 items-end h-3.5">{[1,2,3].map(i=><span key={i} className="w-0.5 rounded-full bg-white animate-bounce" style={{height:`${6+i*3}px`,animationDelay:`${i*100}ms`}}/>)}</span> Speaking</>
              : phase === 'listening'
                ? <><span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"/> Listening</>
                : phase === 'countdown'
                  ? <><span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse"/> Get ready</>
                  : loading
                    ? <><Loader2 className="h-3 w-3 animate-spin"/> Thinking</>
                    : <><Bot className="h-3.5 w-3.5"/> Coach</>
            }
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full mt-1 transition-colors ${
                aiSpeaking && i === messages.length - 1 ? 'bg-brand-600' : 'bg-brand-100 dark:bg-brand-900/40'
              }`}>
                <Bot className={`h-4 w-4 ${aiSpeaking && i === messages.length - 1 ? 'text-white' : 'text-brand-600 dark:text-brand-400'}`} />
              </div>
            )}
            <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${
              m.role === 'user'
                ? 'rounded-tr-sm bg-brand-600 text-white'
                : `rounded-tl-sm shadow-sm ${
                    aiSpeaking && i === messages.length - 1
                      ? 'bg-brand-50 dark:bg-brand-900/30 ring-1 ring-brand-200 dark:ring-brand-700'
                      : 'bg-white dark:bg-slate-800'
                  }`
            }`}>
              {m.role === 'user' && (
                <p className="text-[10px] opacity-60 uppercase tracking-wide mb-0.5">You said</p>
              )}
              {m.role === 'assistant' && aiSpeaking && i === messages.length - 1 && (
                <p className="text-[10px] text-brand-600 dark:text-brand-400 uppercase tracking-wide mb-0.5">Speaking…</p>
              )}
              <p className={`text-sm leading-relaxed ${m.role === 'assistant' ? 'text-ink dark:text-slate-200' : ''}`}>
                {m.content}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40">
              <Bot className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            </div>
            <div className="rounded-2xl rounded-tl-sm bg-white dark:bg-slate-800 px-4 py-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-ink-faint dark:text-slate-500" />
            </div>
          </div>
        )}

        {feedback && (
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-brand-50 dark:from-emerald-900/20 dark:to-brand-900/20 border border-emerald-200 dark:border-emerald-800/40 p-4 space-y-2">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Coach Feedback</p>
            <p className="text-sm text-ink dark:text-slate-200 leading-relaxed">{feedback}</p>
            {xpFlash && (
              <p className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold text-sm animate-xp-float">
                <Zap className="h-4 w-4" /> +40 XP earned!
              </p>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Controls */}
      <div className="sticky bottom-0 bg-[#f6f8f8] dark:bg-[#0f172a] pt-3 pb-2 space-y-3">

        {userTurns >= 4 && !feedback && (
          <button
            onClick={showFeedback}
            className="w-full btn border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30"
          >
            <Zap className="h-4 w-4" /> Get coach feedback (+40 XP)
          </button>
        )}

        {/* Mode toggle */}
        <div className="flex gap-1 rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
          {(['auto', 'push'] as VoiceMode[]).map(m => (
            <button
              key={m}
              onClick={() => {
                setVoiceMode(m)
                voiceModeRef.current = m
                if (phaseRef.current !== 'idle') setPhaseSync('idle')
              }}
              className={`flex-1 rounded-lg py-1.5 text-sm font-semibold transition ${
                voiceMode === m
                  ? 'bg-white dark:bg-slate-700 text-brand-700 dark:text-brand-300 shadow-sm'
                  : 'text-ink-soft dark:text-slate-400'
              }`}
            >
              {m === 'auto' ? 'Auto (hands-free)' : 'Push to speak'}
            </button>
          ))}
        </div>

        {/* Live transcript */}
        {(phase === 'listening' || phase === 'processing') && liveText && (
          <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2.5">
            <p className="text-[10px] font-semibold text-ink-faint dark:text-slate-500 uppercase tracking-wide mb-1">Hearing you say…</p>
            <p className="text-sm text-ink dark:text-slate-200 italic leading-relaxed">{liveText}</p>
          </div>
        )}

        {/* Mic button */}
        <div className="flex flex-col items-center gap-2 py-1">
          {phase === 'countdown' && (
            <p className="text-5xl font-black tabular-nums text-brand-600 dark:text-brand-400 animate-pulse leading-none">
              {countdown === 0 ? 'Go!' : countdown}
            </p>
          )}

          {micStatus === 'denied' ? (
            <div className="flex flex-col items-center gap-1">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <MicOff className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-red-500 text-center">Microphone blocked — check browser settings</p>
            </div>
          ) : (
            <button
              onClick={handleMicClick}
              disabled={phase === 'processing' || loading}
              aria-label={phase === 'listening' ? 'Tap to finish speaking' : 'Tap to speak'}
              className={`relative flex h-20 w-20 items-center justify-center rounded-full shadow-lg transition-all duration-200 focus:outline-none focus:ring-4 ${
                phase === 'listening'
                  ? 'bg-red-500 hover:bg-red-600 scale-110 focus:ring-red-300 dark:focus:ring-red-900'
                  : phase === 'countdown'
                    ? 'bg-amber-400 dark:bg-amber-500 scale-105 focus:ring-amber-300'
                    : phase === 'processing' || loading
                      ? 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                      : 'bg-brand-600 hover:bg-brand-700 hover:scale-105 focus:ring-brand-300 dark:focus:ring-brand-900 active:scale-95'
              }`}
            >
              {phase === 'processing' || loading
                ? <Loader2 className="h-8 w-8 text-white animate-spin" />
                : <Mic className="h-8 w-8 text-white" />
              }
              {phase === 'listening' && (
                <span className="absolute inset-0 rounded-full animate-ping bg-red-400 opacity-25 pointer-events-none" />
              )}
            </button>
          )}

          <p className="text-xs text-ink-faint dark:text-slate-500 text-center leading-tight max-w-xs">
            {phase === 'idle' && !loading && voiceMode === 'auto' && !aiSpeaking && 'Your turn starts automatically after the coach speaks'}
            {phase === 'idle' && !loading && voiceMode === 'auto' && aiSpeaking && 'Coach is speaking…'}
            {phase === 'idle' && !loading && voiceMode === 'push' && 'Tap the mic to start speaking'}
            {phase === 'idle' && loading && 'Coach is thinking…'}
            {phase === 'countdown' && 'Get ready to speak…'}
            {phase === 'listening' && (statusMsg || 'Listening — tap to finish early')}
            {phase === 'processing' && 'Sending…'}
          </p>
        </div>
      </div>
    </div>
  )
}
