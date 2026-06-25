import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, Square, Zap } from 'lucide-react'
import { useProfile } from '../context/ProfileContext'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { SectionTitle } from '../components/ui'
import type { SpeechSession } from '../lib/types'


export default function SpeechTracker() {
  const { awardXp } = useProfile()
  const { user } = useAuth()

  const [active, setActive] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [sessions, setSessions] = useState<SpeechSession[]>([])
  const [supported, setSupported] = useState(true)
  const [micError, setMicError] = useState<string | null>(null)
  const [xpFlash, setXpFlash] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animFrameRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const lastSpeechRef = useRef<number>(0)
  const pauseCountRef = useRef<number>(0)
  const wordCountRef = useRef<number>(0)

  // Check support
  useEffect(() => {
    const hasMic = navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function'
    const w = window as any
    const hasSR = !!(w.SpeechRecognition || w.webkitSpeechRecognition)
    if (!hasMic || !hasSR) setSupported(false)
  }, [])

  // Load session history
  useEffect(() => {
    if (!user) return
    supabase
      .from('sc_speech_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => setSessions((data as SpeechSession[]) ?? []))
  }, [user])

  // Waveform animation
  useEffect(() => {
    if (!active || !canvasRef.current || !analyserRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const analyser = analyserRef.current
    const bufLen = analyser.frequencyBinCount
    const dataArr = new Uint8Array(bufLen)

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw)
      analyser.getByteFrequencyData(dataArr)

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const barW = (canvas.width / bufLen) * 2.5
      let x = 0
      for (let i = 0; i < bufLen; i++) {
        const ratio = dataArr[i] / 255
        const barH = ratio * canvas.height * 0.85
        const lightness = 35 + ratio * 25
        ctx.fillStyle = `hsl(174, 75%, ${lightness}%)`
        ctx.beginPath()
        if (ctx.roundRect) ctx.roundRect(x, canvas.height - barH, Math.max(barW - 1, 1), barH, 2)
        else ctx.rect(x, canvas.height - barH, Math.max(barW - 1, 1), barH)
        ctx.fill()
        x += barW
      }
    }
    draw()
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current) }
  }, [active])

  // Detect pauses (silence > 2s counts as a pause)
  useEffect(() => {
    if (!active) return
    const check = setInterval(() => {
      if (lastSpeechRef.current && Date.now() - lastSpeechRef.current > 2000) {
        pauseCountRef.current += 1
        setPauseCount(pauseCountRef.current)
        lastSpeechRef.current = Date.now() // reset to avoid double counting
      }
    }, 500)
    return () => clearInterval(check)
  }, [active])

  const startSession = useCallback(async () => {
    setMicError(null)
    setTranscript('')
    setInterim('')
    setWordCount(0)
    setSeconds(0)
    setPauseCount(0)
    wordCountRef.current = 0
    pauseCountRef.current = 0
    lastSpeechRef.current = Date.now()

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Web Audio waveform
      const audioCtx = new AudioContext()
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      const source = audioCtx.createMediaStreamSource(stream)
      source.connect(analyser)
      audioCtxRef.current = audioCtx
      analyserRef.current = analyser

      // Speech recognition
      const w2 = window as any
      const SpeechRec = (w2.SpeechRecognition || w2.webkitSpeechRecognition) as any
      const recognition = new SpeechRec()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = 'en-US'

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        lastSpeechRef.current = Date.now()
        let finalText = ''
        let interimText = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const t = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalText += t + ' '
            const newWords = t.trim().split(/\s+/).filter(Boolean).length
            wordCountRef.current += newWords
            setWordCount(wordCountRef.current)
          } else {
            interimText += t
          }
        }
        if (finalText) setTranscript(prev => prev + finalText)
        setInterim(interimText)
      }

      recognition.onerror = () => {}
      recognition.onend = () => {
        if (active) recognition.start()
      }
      recognition.start()
      recognitionRef.current = recognition

      // Timer
      timerRef.current = window.setInterval(() => setSeconds(s => s + 1), 1000)

      setActive(true)
    } catch {
      setMicError("Couldn't access your microphone. Check your browser permissions.")
    }
  }, [active])

  const stopSession = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    recognitionRef.current?.stop()
    recognitionRef.current = null
    streamRef.current?.getTracks().forEach(t => t.stop())
    await audioCtxRef.current?.close()
    audioCtxRef.current = null
    analyserRef.current = null

    const wpm = seconds > 0 ? parseFloat(((wordCountRef.current / seconds) * 60).toFixed(1)) : null

    setActive(false)
    setInterim('')

    if (!user || seconds < 5) return

    const { data } = await supabase
      .from('sc_speech_sessions')
      .insert({
        user_id: user.id,
        duration_seconds: seconds,
        word_count: wordCountRef.current,
        wpm,
        transcript: transcript || null,
        session_type: 'free',
      })
      .select('*')
      .single()

    if (data) {
      setSessions(prev => [data as SpeechSession, ...prev.slice(0, 4)])
      await awardXp(25)
      setXpFlash(true)
      setTimeout(() => setXpFlash(false), 2000)
    }
  }, [seconds, transcript, user, awardXp])

  const wpm = seconds > 5 ? Math.round((wordCount / seconds) * 60) : 0

  if (!supported) {
    return (
      <div className="space-y-5">
        <SectionTitle title="Speech Lab" subtitle="Live speech analysis" />
        <div className="card p-6 text-center">
          <p className="text-ink-soft dark:text-slate-400">
            Speech recognition isn't supported in this browser. Try Chrome or Edge on desktop.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Speech Lab"
        subtitle="Track your pace, fluency, and speaking patterns in real time"
      />

      <div className="card p-5 space-y-4">
        {/* Waveform */}
        <div className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
          active ? 'h-24 bg-slate-900 dark:bg-slate-950' : 'h-16 bg-slate-100 dark:bg-slate-800'
        }`}>
          {active ? (
            <canvas ref={canvasRef} className="w-full h-full" width={600} height={96} />
          ) : (
            <div className="flex h-full items-center justify-center gap-1">
              {Array.from({ length: 20 }, (_, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-slate-300 dark:bg-slate-600"
                  style={{ height: `${20 + Math.sin(i * 0.8) * 14}px` }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Words', value: wordCount },
            { label: 'WPM', value: active && seconds > 5 ? wpm : '—' },
            { label: 'Time', value: `${String(Math.floor(seconds / 60)).padStart(2,'0')}:${String(seconds % 60).padStart(2,'0')}` },
            { label: 'Pauses', value: pauseCount },
          ].map(s => (
            <div key={s.label} className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 text-center">
              <p className="text-lg font-bold tabular-nums text-ink dark:text-slate-100">{s.value}</p>
              <p className="text-xs text-ink-faint dark:text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="flex justify-center">
          {!active ? (
            <button
              className="btn-primary px-10 py-3 text-base"
              onClick={startSession}
            >
              <Mic className="h-5 w-5" /> Start session
            </button>
          ) : (
            <button
              className="btn bg-red-500 text-white hover:bg-red-600 px-10 py-3 text-base"
              onClick={stopSession}
            >
              <Square className="h-5 w-5" /> Stop & save
            </button>
          )}
        </div>

        {micError && (
          <p className="rounded-xl bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {micError}
          </p>
        )}

        {xpFlash && (
          <p className="flex items-center justify-center gap-1.5 text-brand-600 dark:text-brand-400 font-semibold text-sm animate-xp-float">
            <Zap className="h-4 w-4" /> +25 XP — session saved!
          </p>
        )}

        {/* Live transcript */}
        {(transcript || interim) && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3 max-h-40 overflow-y-auto">
            <p className="text-xs font-semibold text-ink-faint dark:text-slate-500 mb-1">Live transcript</p>
            <p className="text-sm text-ink dark:text-slate-200 leading-relaxed">
              {transcript}
              {interim && <span className="text-ink-faint dark:text-slate-500">{interim}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="card p-4 space-y-2">
        <p className="text-xs font-bold uppercase tracking-wide text-ink-faint dark:text-slate-500">What to watch for</p>
        <ul className="space-y-1.5 text-sm text-ink-soft dark:text-slate-400">
          <li>📊 <strong className="text-ink dark:text-slate-200">Target WPM:</strong> 120–160 is natural conversational pace. Under 100 may feel hesitant; above 180 can feel rushed.</li>
          <li>⏸️ <strong className="text-ink dark:text-slate-200">Pauses:</strong> Strategic pauses are good. The tracker flags silences &gt;2 seconds — some are intentional breathing, some are blocks.</li>
          <li>🎯 <strong className="text-ink dark:text-slate-200">Goal:</strong> Notice patterns across sessions — not to be perfect in any one session.</li>
        </ul>
      </div>

      {/* Session history */}
      {sessions.length > 0 && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-ink-soft dark:text-slate-400 mb-3">Recent sessions</p>
          <div className="space-y-2">
            {sessions.map(s => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <span className="text-ink-faint dark:text-slate-500 text-xs">
                  {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-ink dark:text-slate-300">
                    <span className="font-bold">{s.word_count}</span> words
                  </span>
                  {s.wpm && (
                    <span className="text-ink dark:text-slate-300">
                      <span className="font-bold">{s.wpm}</span> WPM
                    </span>
                  )}
                  <span className="text-ink-faint dark:text-slate-500">
                    {Math.floor(s.duration_seconds / 60)}:{String(s.duration_seconds % 60).padStart(2,'0')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
