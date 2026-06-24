import { useEffect, useRef, useState } from 'react'
import { Play, Square } from 'lucide-react'
import type { BreathingTechnique } from '../lib/content'

interface Props {
  technique: BreathingTechnique
  onSessionEnd?: (durationSeconds: number, cycles: number) => void
}

export default function BreathingExercise({ technique, onSessionEnd }: Props) {
  const [running, setRunning] = useState(false)
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(technique.phases[0].seconds)
  const [cycles, setCycles] = useState(0)

  // Refs used inside the animation loop (declared before any effect uses them).
  const startedAt = useRef(0)
  const phaseStart = useRef(0)
  const raf = useRef<number | null>(null)
  const phaseIndexRef = useRef(0)
  const cyclesRef = useRef(0)

  const phase = technique.phases[phaseIndex]

  // Reset when switching technique.
  useEffect(() => {
    hardReset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [technique.id])

  // The breathing loop.
  useEffect(() => {
    if (!running) return
    let mounted = true

    const tick = () => {
      if (!mounted) return
      const now = performance.now()
      const cur = technique.phases[phaseIndexRef.current]
      const elapsed = (now - phaseStart.current) / 1000
      setSecondsLeft(Math.max(1, Math.ceil(cur.seconds - elapsed)))

      if (elapsed >= cur.seconds) {
        const next = (phaseIndexRef.current + 1) % technique.phases.length
        if (next === 0) {
          cyclesRef.current += 1
          setCycles(cyclesRef.current)
        }
        phaseIndexRef.current = next
        setPhaseIndex(next)
        phaseStart.current = now
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)

    return () => {
      mounted = false
      if (raf.current) cancelAnimationFrame(raf.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  function hardReset() {
    setRunning(false)
    if (raf.current) cancelAnimationFrame(raf.current)
    phaseIndexRef.current = 0
    cyclesRef.current = 0
    setPhaseIndex(0)
    setCycles(0)
    setSecondsLeft(technique.phases[0].seconds)
  }

  const start = () => {
    phaseIndexRef.current = 0
    cyclesRef.current = 0
    setPhaseIndex(0)
    setCycles(0)
    setSecondsLeft(technique.phases[0].seconds)
    startedAt.current = performance.now()
    phaseStart.current = performance.now()
    setRunning(true)
  }

  const finish = () => {
    const dur = startedAt.current ? Math.round((performance.now() - startedAt.current) / 1000) : 0
    const completed = cyclesRef.current
    hardReset()
    if (dur > 3) onSessionEnd?.(dur, completed)
  }

  const scale = phase.kind === 'in' ? 1 : phase.kind === 'out' ? 0.5 : 0.78
  const orbColor =
    phase.kind === 'in'
      ? 'from-brand-300 to-brand-500'
      : phase.kind === 'out'
        ? 'from-warm-200 to-warm-400'
        : 'from-slate-200 to-slate-300'

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-60 w-60 items-center justify-center">
        <div className="absolute h-56 w-56 rounded-full bg-brand-100/40 blur-xl" />
        <div
          className={`flex h-56 w-56 items-center justify-center rounded-full bg-gradient-to-br ${orbColor} shadow-lg transition-transform ease-in-out`}
          style={{
            transform: `scale(${running ? scale : 0.7})`,
            transitionDuration: running ? `${phase.seconds}s` : '0.6s',
          }}
        >
          <div className="flex h-40 w-40 flex-col items-center justify-center rounded-full bg-white/85 text-center backdrop-blur">
            {running ? (
              <>
                <span className="text-sm font-semibold uppercase tracking-wide text-ink-soft">
                  {phase.label}
                </span>
                <span className="mt-1 text-4xl font-bold tabular-nums text-ink">{secondsLeft}</span>
                <span className="mt-1 text-xs text-ink-faint">cycle {cycles + 1}</span>
              </>
            ) : (
              <span className="px-6 text-sm text-ink-soft">Press start and follow the orb</span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6">
        {running ? (
          <button className="btn-ghost" onClick={finish}>
            <Square className="h-4 w-4" /> Finish ({cycles} {cycles === 1 ? 'cycle' : 'cycles'})
          </button>
        ) : (
          <button className="btn-primary px-6" onClick={start}>
            <Play className="h-4 w-4" /> Start
          </button>
        )}
      </div>
    </div>
  )
}
