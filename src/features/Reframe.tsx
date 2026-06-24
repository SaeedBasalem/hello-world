import { useEffect, useState } from 'react'
import { Brain, ArrowRight, Loader2, Trash2, Lightbulb } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { REFRAMES, DISTORTIONS } from '../lib/content'
import type { ThoughtRecord } from '../lib/types'
import { Card, SectionTitle, Spinner, Pill, EmptyState } from '../components/ui'
import { prettyDate } from '../lib/dates'

export default function Reframe() {
  const { user } = useAuth()
  const [records, setRecords] = useState<ThoughtRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [flipped, setFlipped] = useState<number[]>([])

  const [situation, setSituation] = useState('')
  const [thought, setThought] = useState('')
  const [distortion, setDistortion] = useState(DISTORTIONS[0])
  const [reframe, setReframe] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    if (!user) return
    const { data } = await supabase
      .from('sc_thought_records')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setRecords((data as ThoughtRecord[]) ?? [])
    setLoading(false)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const save = async () => {
    if (!user || (!thought.trim() && !reframe.trim())) return
    setSaving(true)
    await supabase.from('sc_thought_records').insert({
      user_id: user.id,
      situation: situation.trim() || null,
      automatic_thought: thought.trim() || null,
      distortion,
      reframe: reframe.trim() || null,
    })
    setSituation('')
    setThought('')
    setReframe('')
    setDistortion(DISTORTIONS[0])
    setSaving(false)
    await load()
  }

  const remove = async (id: string) => {
    setRecords(records.filter((r) => r.id !== id))
    await supabase.from('sc_thought_records').delete().eq('id', id)
  }

  return (
    <div className="space-y-5">
      <Card>
        <SectionTitle
          title="Meet your beliefs, then update them"
          subtitle="Naming the thinking trap takes the wind out of it. These reframes aren’t cheerful denial — they’re truer than the original thought. Tap a card to flip it."
          icon={<Brain className="h-5 w-5" />}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {REFRAMES.map((r, i) => {
            const isFlipped = flipped.includes(i)
            return (
              <button
                key={i}
                onClick={() => setFlipped(isFlipped ? flipped.filter((x) => x !== i) : [...flipped, i])}
                className={`min-h-[140px] rounded-2xl p-4 text-left transition ${
                  isFlipped ? 'bg-brand-600 text-white' : 'bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {!isFlipped ? (
                  <div className="flex h-full flex-col">
                    <span className="text-sm font-semibold text-ink">“{r.old}”</span>
                    <span className="mt-2 text-xs text-ink-faint">{r.trap}</span>
                    <span className="mt-auto flex items-center gap-1 pt-3 text-xs font-medium text-brand-600">
                      See a truer thought <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                ) : (
                  <div className="flex h-full flex-col">
                    <Lightbulb className="mb-2 h-5 w-5 text-warm-200" />
                    <span className="text-sm font-medium">{r.truer}</span>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </Card>

      <Card>
        <SectionTitle
          title="Write your own"
          subtitle="Catch a thought, name its trap, and answer it with something truer."
        />
        <div className="space-y-3">
          <div>
            <label className="label mb-1">The situation</label>
            <input
              className="field"
              placeholder="e.g., A group intro is coming up tomorrow"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
            />
          </div>
          <div>
            <label className="label mb-1">The automatic thought</label>
            <input
              className="field"
              placeholder="The exact sentence your mind produces"
              value={thought}
              onChange={(e) => setThought(e.target.value)}
            />
          </div>
          <div>
            <label className="label mb-1.5">The thinking trap</label>
            <div className="flex flex-wrap gap-2">
              {DISTORTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setDistortion(d)}
                  className={`chip ${distortion === d ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-soft hover:bg-slate-200'}`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label mb-1">A truer thing to tell yourself</label>
            <textarea
              className="field min-h-[70px] resize-y"
              placeholder="Truer, not just nicer."
              value={reframe}
              onChange={(e) => setReframe(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Save this reframe
          </button>
        </div>
      </Card>

      <Card>
        <SectionTitle title="Your reframes" />
        {loading ? (
          <Spinner />
        ) : records.length === 0 ? (
          <EmptyState
            icon={<Brain className="h-8 w-8" />}
            title="No reframes yet"
            body="Each one you write is a piece of evidence your inner critic doesn’t want you to have."
          />
        ) : (
          <ul className="space-y-3">
            {records.map((r) => (
              <li key={r.id} className="rounded-xl border border-slate-100 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.distortion && <Pill tone="warm">{r.distortion}</Pill>}
                    <span className="text-xs text-ink-faint">{prettyDate(r.created_at.slice(0, 10))}</span>
                  </div>
                  <button onClick={() => remove(r.id)} className="text-ink-faint hover:text-red-500" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                {r.situation && <p className="text-xs text-ink-faint">{r.situation}</p>}
                {r.automatic_thought && (
                  <p className="mt-1 text-sm text-ink-soft line-through decoration-slate-300">
                    “{r.automatic_thought}”
                  </p>
                )}
                {r.reframe && (
                  <p className="mt-2 flex items-start gap-2 text-sm font-medium text-ink">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-warm-500" /> {r.reframe}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
