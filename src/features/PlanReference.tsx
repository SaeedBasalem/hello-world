import { useEffect, useState } from 'react'
import { Compass, Loader2, Check, HeartHandshake, LifeBuoy } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  PRINCIPLES,
  PERSONAL_NOTES,
  ASSESSMENT_FIELDS,
  type SelfAssessmentForm,
} from '../lib/content'
import type { SelfAssessment } from '../lib/types'
import { Card, SectionTitle, Spinner } from '../components/ui'

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

export default function PlanReference() {
  const { user } = useAuth()
  const [form, setForm] = useState<SelfAssessmentForm>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!user) return
    ;(async () => {
      const { data } = await supabase.from('sc_self_assessment').select('*').eq('user_id', user.id).maybeSingle()
      if (data) {
        const d = data as SelfAssessment
        setForm({
          hardest_situations: d.hardest_situations ?? '',
          loaded_sounds: d.loaded_sounds ?? '',
          swap_habits: d.swap_habits ?? '',
          body_signals: d.body_signals ?? '',
          automatic_thoughts: d.automatic_thoughts ?? '',
          went_well: d.went_well ?? '',
          went_badly: d.went_badly ?? '',
          support: d.support ?? '',
        })
      }
      setLoading(false)
    })()
  }, [user])

  const save = async () => {
    if (!user) return
    setSaving(true)
    await supabase
      .from('sc_self_assessment')
      .upsert({ user_id: user.id, ...form, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          title="Your pattern, briefly"
          subtitle="These personalized notes take priority over the general toolkit wherever they differ."
          icon={<Compass className="h-5 w-5" />}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {PERSONAL_NOTES.map((n) => (
            <div key={n.title} className="rounded-xl bg-brand-50/60 p-4">
              <p className="text-sm font-bold text-brand-800">{n.title}</p>
              <p className="mt-1 text-sm text-ink-soft">{n.body}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <SectionTitle title="Self-assessment" subtitle="Update this anytime — knowing your pattern makes every other part sharper." />
        {loading ? (
          <Spinner />
        ) : (
          <div className="space-y-4">
            {ASSESSMENT_FIELDS.map((f) => (
              <div key={f.key}>
                <label className="label mb-1">{f.label}</label>
                <p className="mb-1.5 text-xs text-ink-faint">{f.hint}</p>
                <textarea
                  className="field min-h-[60px] resize-y"
                  value={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                />
              </div>
            ))}
            <div className="flex items-center gap-3">
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save
              </button>
              {saved && (
                <span className="flex items-center gap-1 text-sm text-emerald-700">
                  <Check className="h-4 w-4" /> Saved
                </span>
              )}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="The four principles" icon={<HeartHandshake className="h-5 w-5" />} />
        <div className="space-y-3">
          {PRINCIPLES.map((p, i) => (
            <div key={p.title} className="flex gap-3 rounded-xl bg-slate-50 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="text-sm text-ink-soft">
                <span className="font-semibold text-ink">{p.title}.</span> {p.body}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="border border-warm-200 bg-warm-50/40">
        <SectionTitle title="When to bring in a professional" icon={<LifeBuoy className="h-5 w-5" />} />
        <div className="space-y-3 text-sm text-ink-soft">
          <p>
            You can begin everything here on your own — but two kinds of support are genuinely high-leverage,
            and seeking them is a sign of seriousness, not weakness:
          </p>
          <p>
            <span className="font-semibold text-ink">A speech-language pathologist who specializes in stuttering</span>{' '}
            is the single most valuable resource for the speech side — real-time technique feedback no app can
            give. Many also do the acceptance and desensitization work.
          </p>
          <p>
            <span className="font-semibold text-ink">A trauma-informed therapist</span> (CBT, ACT, or
            trauma-focused) for the childhood experiences and the anxiety underneath them.
          </p>
          <p className="rounded-lg bg-white/70 p-3 text-ink-soft">
            Reach out sooner rather than later if anxiety is significantly limiting your school, work, or
            relationships; your mood is persistently low; the past intrudes; or you feel stuck despite
            consistent effort. If anxiety ever brings thoughts of harming yourself or a feeling you can’t cope,
            please treat that as a reason to contact a mental health professional or a local crisis line
            promptly.
          </p>
        </div>
      </Card>
    </div>
  )
}
