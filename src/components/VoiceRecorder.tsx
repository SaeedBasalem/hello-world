import { useEffect, useRef, useState } from 'react'
import { Mic, Square, RotateCcw, Play } from 'lucide-react'

/**
 * Records a short voice memo in the browser for the daily "one real rep" and
 * Level 2 of the ladder. Audio stays in memory only — it is never uploaded,
 * which keeps it fully private. Listen back once, without grading yourself.
 */
export default function VoiceRecorder() {
  const [supported, setSupported] = useState(true)
  const [recording, setRecording] = useState(false)
  const [url, setUrl] = useState<string | null>(null)
  const [seconds, setSeconds] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunks = useRef<BlobPart[]>([])
  const timer = useRef<number | null>(null)

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof MediaRecorder === 'undefined') {
      setSupported(false)
    }
    return () => {
      if (timer.current) window.clearInterval(timer.current)
      if (url) URL.revokeObjectURL(url)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunks.current = []
      mr.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data)
      mr.onstop = () => {
        const blob = new Blob(chunks.current, { type: mr.mimeType || 'audio/webm' })
        if (url) URL.revokeObjectURL(url)
        setUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }
      mr.start()
      mediaRef.current = mr
      setRecording(true)
      setSeconds(0)
      if (url) {
        URL.revokeObjectURL(url)
        setUrl(null)
      }
      timer.current = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    } catch {
      setError('I couldn’t access your microphone. You can still narrate aloud — that counts too.')
    }
  }

  const stop = () => {
    mediaRef.current?.stop()
    setRecording(false)
    if (timer.current) window.clearInterval(timer.current)
  }

  const reset = () => {
    if (url) URL.revokeObjectURL(url)
    setUrl(null)
    setSeconds(0)
  }

  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

  if (!supported) {
    return (
      <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-ink-soft">
        Recording isn’t supported in this browser — narrating a task aloud works just as well.
      </p>
    )
  }

  return (
    <div className="rounded-xl bg-slate-50 p-4">
      <div className="flex flex-wrap items-center gap-3">
        {!recording ? (
          <button className="btn-primary" onClick={start}>
            <Mic className="h-4 w-4" /> {url ? 'Record again' : 'Record 60s memo'}
          </button>
        ) : (
          <button className="btn bg-red-500 text-white hover:bg-red-600" onClick={stop}>
            <Square className="h-4 w-4" /> Stop
          </button>
        )}
        <span className="font-mono text-sm tabular-nums text-ink-soft">
          {recording && <span className="mr-1 inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />}
          {mmss}
        </span>
        {url && !recording && (
          <button className="btn-ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" /> Clear
          </button>
        )}
      </div>

      {url && (
        <div className="mt-3">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs text-ink-faint">
            <Play className="h-3.5 w-3.5" /> Listen back once — just notice, don’t grade.
          </div>
          <audio controls src={url} className="w-full" />
        </div>
      )}

      {error && <p className="mt-2 text-sm text-amber-700">{error}</p>}
    </div>
  )
}
