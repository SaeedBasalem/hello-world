import { useState } from 'react'
import { Wind, Anchor, LifeBuoy, Hand, Check, Sparkles } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  BREATHING_TECHNIQUES,
  GROUNDING_5_4_3_2_1,
  WHEN_YOU_STUTTER,
  FLUENCY_TOOLS,
} from '../lib/content'
import { Card, SectionTitle, AnxietyScale, Pill } from '../components/ui'
import BreathingExercise from '../components/BreathingExercise'

export default function Calm() {
  const { user } = useAuth()
  const [techId, setTechId] = useState(BREATHING_TECHNIQUES[0].id)
  const [before, setBefore] = useState<number | null>(null)
  const [after, setAfter] = useState<number | null>(null)
  const [lastDuration, setLastDuration] = useState<number | null>(null)
  const [saved, setSaved] = useState(false)
  const [grounded, setGrounded] = useState<number[]>([])

  const technique = BREATHING_TECHNIQUES.find((t) => t.id === techId)!

  const onSessionEnd = (duration: number) => {
    setLastDuration(duration)
    setSaved(false)
  }

  const logSession = async () => {
    if (!user) return
    await supabase.from('sc_breathing_sessions').insert({
      user_id: user.id,
      technique: technique.name,
      duration_seconds: lastDuration,
      anxiety_before: before,
      anxiety_after: after,
    })
    setSaved(true)
    setLastDuration(null)
    setBefore(null)
    setAfter(null)
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          title="Breathe"
          subtitle="The active ingredient in all of these is a long, slow exhale — it shifts your body toward calm and slows the heart."
          icon={<Wind className="h-5 w-5" />}
        />
        <div className="mb-5 flex flex-wrap gap-2">
          {BREATHING_TECHNIQUES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTechId(t.id)}
              className={`rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
                t.id === techId ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft hover:bg-slate-200'
              }`}
            >
              {t.name}
              {t.tag && t.id !== techId && <span className="ml-1.5 text-xs text-warm-600">· {t.tag}</span>}
            </button>
          ))}
        </div>

        <p className="mb-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-ink-soft">{technique.blurb}</p>

        {/* Optional before rating */}
        <div className="mb-5">
          <AnxietyScale label="Before (optional)" value={before} onChange={setBefore} />
        </div>

        <BreathingExercise technique={technique} onSessionEnd={onSessionEnd} />

        {lastDuration !== null && (
          <div className="mt-6 animate-fade-in rounded-xl border border-brand-100 bg-brand-50/50 p-4">
            <p className="text-sm font-semibold text-ink">Nice — {lastDuration}s of steadier breathing.</p>
            <div className="mt-3">
              <AnxietyScale label="And now?" value={after} onChange={setAfter} />
            </div>
            <button className="btn-primary mt-4" onClick={logSession}>
              Log this session
            </button>
          </div>
        )}
        {saved && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-700">
            <Check className="h-4 w-4" /> Logged. It’ll show up in your Progress trends.
          </p>
        )}
      </Card>

      <Card>
        <SectionTitle
          title="5–4–3–2–1 grounding"
          subtitle="When thoughts race, pull attention out of the spiral and into the present. Tap each as you name them."
          icon={<Anchor className="h-5 w-5" />}
        />
        <div className="space-y-2">
          {GROUNDING_5_4_3_2_1.map((g) => {
            const on = grounded.includes(g.n)
            return (
              <button
                key={g.n}
                onClick={() => setGrounded(on ? grounded.filter((x) => x !== g.n) : [...grounded, g.n])}
                className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                  on ? 'border-brand-200 bg-brand-50' : 'border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-bold ${
                    on ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft'
                  }`}
                >
                  {on ? <Check className="h-5 w-5" /> : g.n}
                </span>
                <span className={`text-sm ${on ? 'text-ink-faint line-through' : 'text-ink'}`}>{g.prompt}</span>
              </button>
            )
          })}
        </div>
        {grounded.length === 5 && (
          <p className="mt-3 animate-fade-in text-sm font-medium text-brand-700">
            You’re here, in this room, right now. That’s the whole exercise. ✦
          </p>
        )}
        {grounded.length > 0 && grounded.length < 5 && (
          <button className="btn-ghost mt-2 text-xs" onClick={() => setGrounded([])}>
            Reset
          </button>
        )}
      </Card>

      <Card>
        <SectionTitle
          title="When a block happens"
          subtitle="A move you control beats a feeling of helplessness."
          icon={<LifeBuoy className="h-5 w-5" />}
        />
        <ol className="space-y-2">
          {WHEN_YOU_STUTTER.map((s, i) => (
            <li key={i} className="flex gap-3 rounded-xl bg-slate-50 p-3 text-sm text-ink-soft">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-warm-100 text-xs font-bold text-warm-600">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs italic text-ink-faint">
          After a hard one, talk to yourself like a good friend: “That was a tough one. Hard moments are part
          of speaking. It says nothing about my worth.”
        </p>
      </Card>

      <Card>
        <SectionTitle
          title="Fluency toolkit"
          subtitle="Tools, not rules. Best shaped over time with a stuttering-specialist SLP — but you can begin now."
          icon={<Hand className="h-5 w-5" />}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {FLUENCY_TOOLS.map((tool) => (
            <div key={tool.title} className="rounded-xl border border-slate-100 p-4">
              <div className="mb-1.5">
                <Pill tone="brand">
                  <Sparkles className="h-3 w-3" /> {tool.title}
                </Pill>
              </div>
              <p className="text-sm text-ink-soft">{tool.body}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
