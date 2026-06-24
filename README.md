# Steady — a speaking-confidence & fluency companion

> _Speak with less struggle, more openness._

**Steady** turns a personal speaking-confidence & fluency plan into a gentle, interactive daily
companion. It’s built for someone working through a stutter and the social anxiety layered on top of it —
the goal isn’t “zero stuttering,” it’s **easy speaking**: less fear, less hiding, more openness, watched as
a trend over weeks rather than judged day to day.

It’s a React + TypeScript single-page app, backed by **Supabase** (Postgres + Auth) with strict
per-user row-level security, and it deploys automatically to **GitHub Pages**.

---

## What it does

| Area | What you can do |
|---|---|
| **Home** | A daily greeting, a rotating encouragement, today’s routine progress, a one-tap “I said it anyway” win button, and quick links into every tool. |
| **Daily routine** | Work the Morning → Practice → Evening routine as a friendly checklist, with guidance for each step, a built-in **voice-memo recorder** for your daily “real rep,” and a link straight to tonight’s reflection. |
| **Calm tools** | An **animated guided-breathing** orb (extended-exhale, physiological sigh, box breathing) with optional before/after anxiety logging, interactive **5-4-3-2-1 grounding**, in-the-moment block recovery, and the fluency toolkit. |
| **Exposure ladder** | All 12 levels with goals and “ready to move up when…” cues. Log attempts with before/after anxiety, mark how it went, and move up or step back at your own pace. |
| **Word-swap lever** | Your single biggest lever. One tap to record “I said it anyway” (a win) vs. “I swapped,” with optional word/situation, today’s tally, and a 14-day view. |
| **Reframe (CBT)** | Flip-card belief reframes, plus a thought-record builder (situation → automatic thought → thinking trap → a truer thought) that saves your growing evidence file. |
| **Journal** | A structured nightly reflection — one win, one hard moment + how you responded, one thing to try tomorrow, and an optional anxiety rating — plus a timeline of past entries. |
| **Progress** | Trend charts for anxiety, the word-swap ratio, and routine adherence, summary stats, and the full **weekly review** (auto-suggesting your swap count and routine days from your logs). |
| **My plan** | Your personalized notes, the four principles, an editable self-assessment, and guidance on when to bring in a professional. |

Every tracked value is **private to you** — Postgres row-level security restricts every row to its owner,
so no other account can read your reflections.

---

## Tech stack

- **Vite + React 18 + TypeScript**
- **Tailwind CSS** for styling (calm sage/teal + warm amber palette)
- **Recharts** for trend charts (lazy-loaded so the first paint stays light)
- **lucide-react** icons
- **Supabase** — Postgres database + email/password Auth, accessed client-side with a publishable key
  protected by RLS

### Data model (Supabase)

All tables are prefixed `sc_` and have RLS enabled with per-user policies
(`auth.uid() = user_id`):

`sc_profiles`, `sc_self_assessment`, `sc_routine_days`, `sc_journal_entries`,
`sc_ladder_attempts`, `sc_swap_events`, `sc_breathing_sessions`, `sc_thought_records`,
`sc_weekly_reviews`.

---

## Run it locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build locally
```

The Supabase connection lives in `src/lib/supabaseConfig.ts`. The key there is a **publishable**
(anon) key — it’s designed to be shipped in client code, and all access is gated by row-level
security, so committing it is safe.

---

## Deployment (GitHub Pages)

A GitHub Actions workflow (`.github/workflows/deploy.yml`) builds the app and publishes it on every
push to the default branch.

**One-time setup:** in the repository, go to **Settings → Pages → Build and deployment** and set the
**Source** to **GitHub Actions**. After the next push to the default branch (or a manual
“Run workflow”), the app goes live at:

```
https://<your-username>.github.io/hello-world/
```

The Vite `base` is set to `/hello-world/` to match the repository name (see `vite.config.ts`). If you
rename the repo, update that base path.

> If email confirmation is enabled on your Supabase project, creating an account sends a confirmation
> link to your inbox; click it, then return and sign in.

---

## A note

Steady is a self-help companion, not a substitute for a speech-language pathologist who specializes in
stuttering, or a trauma-informed therapist. Both are high-leverage support, and seeking them is a sign of
seriousness, not weakness.
