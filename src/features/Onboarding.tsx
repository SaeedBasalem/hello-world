import { useState } from 'react'
import { ArrowRight, Sparkles, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { APP_NAME, ASSESSMENT_FIELDS, PRINCIPLES, type SelfAssessmentForm } from '../lib/content'

const EMPTY: SelfAssessmentForm = {
  hardest_situations: '',
  loaded_sounds: '',
  swap_habits: '',
  body_signals: '',
  automatic_thoughts: '',
  went_well: '',
  went_badly: '',
  support: '',
}

export default function Onboarding() {
  const { user } = useAuth()
  const { update } = useProfile()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [form, setForm] = useState<SelfAssessmentForm>(EMPTY)
  const [busy, setBusy] = useState(false)

  const finish = async (saveAssessment: boolean) => {
    if (!user) return
    setBusy(true)
    try {
      if (saveAssessment) {
        await supabase.from('sc_self_assessment').upsert(
          { user_id: user.id, ...form, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' },
        )
      }
      await update({ display_name: name.trim() || null, onboarded: true })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-brand-50 to-[#f6f8f8] px-5 py-10">
      <div className="mx-auto max-w-2xl">
        {step === 0 && (
          <div className="card animate-fade-in p-7 sm:p-9">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-sm font-semibold text-brand-700">
              <Sparkles className="h-4 w-4" /> Welcome to {APP_NAME}
            </div>
            <h1 className="text-2xl font-extrabold text-ink">Let’s set this up to fit you.</h1>
            <p className="mt-2 text-ink-soft">
              This is your private space. Before we dive in, four ideas sit underneath everything here —
              they matter more than any single exercise.
            </p>
            <ul className="mt-5 space-y-3">
              {PRINCIPLES.map((p, i) => (
                <li key={p.title} className="flex gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="text-sm text-ink-soft">
                    <span className="font-semibold text-ink">{p.title}.</span> {p.body}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-7">
              <label className="label mb-1.5">What should I call you?</label>
              <input
                className="field"
                placeholder="Your name or a nickname"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <button className="btn-primary mt-6 w-full" onClick={() => setStep(1)}>
              Continue <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="card animate-fade-in p-7 sm:p-9">
            <h1 className="text-2xl font-extrabold text-ink">A quick self-assessment</h1>
            <p className="mt-2 text-ink-soft">
              Knowing your specific pattern makes every other part sharper. There are no wrong answers, and
              you can edit or skip any of this later under <span className="font-medium">My plan</span>.
            </p>

            <div className="mt-6 space-y-4">
              {ASSESSMENT_FIELDS.map((f) => (
                <div key={f.key}>
                  <label className="label mb-1">{f.label}</label>
                  <p className="mb-1.5 text-xs text-ink-faint">{f.hint}</p>
                  <textarea
                    className="field min-h-[64px] resize-y"
                    value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  />
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <button className="btn-primary flex-1" onClick={() => finish(true)} disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                Save & start
              </button>
              <button className="btn-ghost flex-1" onClick={() => finish(false)} disabled={busy}>
                Skip for now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
