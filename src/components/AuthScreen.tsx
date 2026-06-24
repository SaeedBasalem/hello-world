import { useState } from 'react'
import { Mail, Lock, Loader2, Sparkles, HeartHandshake } from 'lucide-react'
import { supabase, authRedirectTo } from '../lib/supabase'
import { APP_NAME, PRINCIPLES } from '../lib/content'

type Mode = 'signin' | 'signup'

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: authRedirectTo() },
        })
        if (error) throw error
        // If email confirmation is required, there's no active session yet.
        if (!data.session) {
          setInfo(
            'Almost there — check your inbox for a confirmation link, then come back and sign in. (It may take a minute, and check spam.)',
          )
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      setError(msg)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-brand-50 via-[#f6f8f8] to-[#f6f8f8]">
      <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-5 py-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: welcome / story */}
        <div className="animate-fade-in">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-brand-700 shadow-sm ring-1 ring-brand-100">
            <Sparkles className="h-4 w-4" /> {APP_NAME}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
            Speak with less struggle,
            <br />
            <span className="text-brand-600">more openness.</span>
          </h1>
          <p className="mt-4 max-w-md text-ink-soft">
            A gentle, private companion built from your speaking-confidence plan. It turns the plan into a
            daily practice you can actually keep — breathing tools you can do in 90 seconds, a step-by-step
            exposure ladder, your word-swap lever, and a place to watch your progress trend upward.
          </p>

          <ul className="mt-6 space-y-3">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="flex items-start gap-3">
                <HeartHandshake className="mt-0.5 h-5 w-5 shrink-0 text-brand-500" />
                <span className="text-sm text-ink-soft">
                  <span className="font-semibold text-ink">{p.title}.</span> {p.body}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: auth card */}
        <div className="animate-fade-in">
          <div className="card mx-auto w-full max-w-md p-6 sm:p-8">
            <div className="mb-6 flex rounded-xl bg-slate-100 p-1 text-sm font-semibold">
              <button
                className={`flex-1 rounded-lg py-2 transition ${mode === 'signup' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-soft'}`}
                onClick={() => {
                  setMode('signup')
                  setError(null)
                  setInfo(null)
                }}
              >
                Create account
              </button>
              <button
                className={`flex-1 rounded-lg py-2 transition ${mode === 'signin' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-soft'}`}
                onClick={() => {
                  setMode('signin')
                  setError(null)
                  setInfo(null)
                }}
              >
                Sign in
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label mb-1.5" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="field pl-9"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="label mb-1.5" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="field pl-9"
                    placeholder="At least 6 characters"
                  />
                </div>
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}
              {info && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">{info}</p>
              )}

              <button type="submit" className="btn-primary w-full" disabled={busy}>
                {busy && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'signup' ? 'Create my account' : 'Sign in'}
              </button>
            </form>

            <p className="mt-5 text-center text-xs leading-relaxed text-ink-faint">
              Your reflections are private to you — protected so no one else can read them.
              {APP_NAME} is a self-help companion, not a substitute for a speech-language pathologist
              or therapist.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
