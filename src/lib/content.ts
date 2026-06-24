// Static content distilled directly from the Speaking-Confidence & Fluency Plan.
// Keeping it here means the whole app speaks with one consistent, warm voice.

import type { RoutineTask } from './types'

export const APP_NAME = 'Steady'
export const APP_TAGLINE = 'Speak with less struggle, more openness.'

// The four principles that run underneath everything (Plan: "How this plan works").
export const PRINCIPLES: { title: string; body: string }[] = [
  {
    title: 'Your stutter is not a flaw',
    body: 'It is a neurological difference in how speech is timed — not caused by anxiety, weakness, or anything you did. The fear and bracing layered on top is the changeable part. We work on that layer.',
  },
  {
    title: 'The goal is easy speaking, not perfect speaking',
    body: 'Chasing zero stuttering increases tension. Aim lower and truer: less struggle, less fear, more openness. Smoother speech follows from dropping the fight — not the other way around.',
  },
  {
    title: 'Body first, then mind, then mouth',
    body: 'A nervous system that reads speaking as danger will race no matter how good your mindset is. We start with breath and body, which you can steer, and let calm make room for the rest.',
  },
  {
    title: 'Progress is measured in trends, not days',
    body: 'Some days are worse for no reason. That is normal. You are watching the direction of the line over weeks — never the height of a single point.',
  },
]

// The personalized notes (Plan: "Personalized for you").
export const PERSONAL_NOTES: { title: string; body: string }[] = [
  {
    title: 'Your triggers are situational, not phonetic',
    body: 'Your own name is fine; specific sounds are fine. The spike comes from social-evaluative pressure — being put on the spot, group intros, more people, and hearing others sound fluent right before you.',
  },
  {
    title: 'Lever #1 — ease off word-swapping',
    body: 'Swapping feels safe but keeps the fear alive and runs a constant background search for an easier word. When you feel the urge, say the original word anyway, gently. A stutter on the real word is a win; a smooth swap is the fear winning quietly.',
  },
  {
    title: 'Being put on the spot? Buy time legitimately',
    body: 'Pause 2–3 seconds (it reads as thoughtful). Use a bridge phrase — “Good question, give me a second.” Start with the easiest true thing, even one word.',
  },
  {
    title: 'The comparison spike',
    body: 'You are comparing your insides (all you feel struggling) to their outsides (their smooth surface). Fluency was never the scoreboard — clear, warm, interesting wins. Redirect that waiting-room attention to your breath and your point.',
  },
]

// Daily routine tasks (Plan: Part 2).
export const ROUTINE_TASKS: {
  key: RoutineTask
  phase: 'Morning' | 'Practice' | 'Evening'
  title: string
  minutes: string
  how: string
  why: string
}[] = [
  {
    key: 'morning_prime',
    phase: 'Morning',
    title: 'Prime — regulate & set the frame',
    minutes: '~5 min',
    how: 'Take 4–6 slow breaths with a long exhale (or 4 physiological sighs). Then read one line aloud that you believe: “My job today is to speak, not to speak perfectly.”',
    why: 'A calm body and a clear frame lower the baseline before the day asks anything of you.',
  },
  {
    key: 'easy_reading',
    phase: 'Practice',
    title: 'Easy reading',
    minutes: '4–5 min',
    how: 'Read a paragraph aloud, slowly, using gentle onset and light contact. Reading removes the pressure of what to say so you can practice how.',
    why: 'Low-stakes reps groove the technique so it starts to feel automatic.',
  },
  {
    key: 'voluntary_stutter',
    phase: 'Practice',
    title: 'Befriend the stutter',
    minutes: '2–3 min',
    how: 'Deliberately, gently stutter on a few easy words on purpose. It sounds backwards — it is one of the most effective desensitizers there is.',
    why: 'Voluntary stuttering teaches your nervous system the feared thing is survivable, which lowers the fear and loosens the grip.',
  },
  {
    key: 'real_rep',
    phase: 'Practice',
    title: 'One real rep',
    minutes: '2–3 min',
    how: 'Record a 60-second voice memo about your day, narrate a task aloud, or have one short real interaction. Listen back once without grading yourself.',
    why: 'A small daily promise kept is how self-trust is actually built.',
  },
  {
    key: 'evening_reflect',
    phase: 'Evening',
    title: 'Reflect',
    minutes: '~3 min',
    how: 'Write one win, one hard moment + how you responded (not whether you stuttered), and one thing to try tomorrow.',
    why: 'Self-criticism is loud and has good memory; wins are quiet and forgettable. Writing them builds the evidence file your inner critic does not want you to have.',
  },
]

// CBT reframes (Plan: Part 4 — "Meet your beliefs, then update them").
export const REFRAMES: { old: string; trap: string; truer: string }[] = [
  {
    old: 'People will think I sound stupid.',
    trap: 'Mind-reading — you cannot actually know what others think.',
    truer:
      'Listeners track meaning far more than smoothness. My ideas carry more weight than my delivery.',
  },
  {
    old: "I'll mess up my words.",
    trap: 'Fortune-telling.',
    truer: 'Some words may come out bumpy. Bumpy isn’t broken — I can pause, ease in, and keep going.',
  },
  {
    old: 'Everyone will notice my stutter.',
    trap: 'Magnifying the spotlight.',
    truer:
      'Even when a moment shows, most people are absorbed in themselves and in what I mean — not grading my fluency.',
  },
  {
    old: "I'm not good enough.",
    trap: 'Labeling — a voice learned from old criticism.',
    truer:
      'My worth was never up for debate based on how I speak. I learned that rule from someone unsafe. I’m allowed to update it.',
  },
]

export const DISTORTIONS = [
  'Mind-reading',
  'Fortune-telling',
  'Magnifying / spotlight',
  'Labeling',
  'All-or-nothing',
  'Catastrophizing',
  'Other',
]

// Fluency toolkit (Plan: Part 3).
export const FLUENCY_TOOLS: { title: string; body: string }[] = [
  {
    title: 'Gentle (easy) onset',
    body: 'Start a word with a soft, breathy beginning and ease into the sound rather than slamming into it. Let a little airflow lead the voice in.',
  },
  {
    title: 'Light articulatory contact',
    body: 'Let your lips, tongue, and jaw touch lightly instead of pressing hard. Tension is what turns a sound into a block.',
  },
  {
    title: 'Stretch & connect',
    body: 'Stretch the first sound slightly and keep the voice connected through a phrase, rather than stop-start-stop.',
  },
  {
    title: 'Slow down — gently',
    body: 'Not robotic; just unhurried. Speed is pressure.',
  },
  {
    title: 'Pause on purpose',
    body: 'Break sentences into short chunks with deliberate pauses. Pauses buy planning time and sound confident and considered to listeners.',
  },
  {
    title: 'Pull-out',
    body: 'If you’re stuck mid-block, don’t yank — ease out of it slowly into the sound.',
  },
  {
    title: 'Cancellation',
    body: 'After a stuttered word, pause, breathe, and calmly say it again with easy onset. It replaces helplessness with a move you control.',
  },
]

// When you stutter, do this (Plan: Part 3).
export const WHEN_YOU_STUTTER: string[] = [
  'Stop forcing. Let the moment be what it is.',
  'Breathe out and let your throat and jaw soften.',
  'Continue — no apology, no over-explaining, no rushing to make up for it.',
  'In safe contexts, you can name it lightly: “I stutter sometimes — bear with me.”',
]

// Breathing techniques (Plan: Part 6). Phases drive the animated guide.
export interface BreathPhase {
  label: string
  seconds: number
  kind: 'in' | 'out' | 'hold'
}
export interface BreathingTechnique {
  id: string
  name: string
  blurb: string
  tag?: string
  phases: BreathPhase[]
}

export const BREATHING_TECHNIQUES: BreathingTechnique[] = [
  {
    id: 'extended-exhale',
    name: 'Extended-exhale breathing',
    blurb: 'Inhale through the nose, then a long, slow exhale through pursed lips. The long out-breath is the active ingredient.',
    phases: [
      { label: 'Breathe in', seconds: 4, kind: 'in' },
      { label: 'Slow exhale', seconds: 7, kind: 'out' },
    ],
  },
  {
    id: 'physiological-sigh',
    name: 'Physiological sigh',
    tag: 'Fastest',
    blurb: 'Two inhales through the nose (a breath, then a small top-up), then a long exhale through the mouth. Calms quickly.',
    phases: [
      { label: 'Inhale', seconds: 2, kind: 'in' },
      { label: 'Top-up inhale', seconds: 1, kind: 'in' },
      { label: 'Long exhale', seconds: 6, kind: 'out' },
    ],
  },
  {
    id: 'box',
    name: 'Box breathing',
    blurb: 'In 4 / hold 4 / out 4 / hold 4. Skip the holds if they make you light-headed.',
    phases: [
      { label: 'Breathe in', seconds: 4, kind: 'in' },
      { label: 'Hold', seconds: 4, kind: 'hold' },
      { label: 'Breathe out', seconds: 4, kind: 'out' },
      { label: 'Hold', seconds: 4, kind: 'hold' },
    ],
  },
]

export const GROUNDING_5_4_3_2_1: { n: number; sense: string; prompt: string }[] = [
  { n: 5, sense: 'see', prompt: 'Name 5 things you can see' },
  { n: 4, sense: 'hear', prompt: 'Name 4 things you can hear' },
  { n: 3, sense: 'feel', prompt: 'Name 3 things you can feel' },
  { n: 2, sense: 'smell', prompt: 'Name 2 things you can smell' },
  { n: 1, sense: 'taste', prompt: 'Name 1 thing you can taste' },
]

// The exposure ladder (Plan: Part 5).
export interface LadderLevel {
  level: number
  title: string
  goal: string
  duration: string
  readyWhen: string
}

export const LADDER_LEVELS: LadderLevel[] = [
  { level: 1, title: 'Read aloud alone', goal: 'Read aloud to yourself or a pet with easy onset.', duration: 'A few sessions over ~1 week', readyWhen: 'The reading feels calm; techniques start to feel automatic.' },
  { level: 2, title: 'Record & listen back', goal: 'Record a 1-minute voice memo, then listen back.', duration: '~1 week', readyWhen: 'You can listen without harsh self-judgment.' },
  { level: 3, title: 'Mirror / narrate aloud', goal: 'Talk to yourself in the mirror or narrate tasks, holding your own eye contact.', duration: 'A few days', readyWhen: 'You stay relaxed while watching yourself speak.' },
  { level: 4, title: 'One scripted real line', goal: 'One scripted low-stakes line — order a coffee, greet a cashier.', duration: '~1–2 weeks', readyWhen: 'You can do it without rehearsing an escape.' },
  { level: 5, title: 'Short phone call', goal: 'A short, low-stakes phone call — ask a shop their hours.', duration: '~1–2 weeks', readyWhen: 'Phone anxiety drops a couple of points.' },
  { level: 6, title: '1-on-1, no word-swap', goal: 'A 1-on-1 chat with a safe person where you deliberately don’t word-swap.', duration: '~1–2 weeks', readyWhen: 'You can let a stutter happen with them and stay present.' },
  { level: 7, title: 'Voluntary stuttering out loud', goal: 'Voluntary stuttering on purpose — with a safe person, then a stranger.', duration: '~1–2 weeks', readyWhen: 'Fear of the stutter itself noticeably decreases.' },
  { level: 8, title: 'Ask a question in a group', goal: 'Ask one question in a small group (class or meeting).', duration: '~2 weeks', readyWhen: 'You can speak up once without spiraling afterward.' },
  { level: 9, title: 'Share an opinion', goal: 'Share an opinion or a longer point in a small group.', duration: '~2 weeks', readyWhen: 'You can speak >30 seconds without abandoning your point.' },
  { level: 10, title: 'Prepared talk to 1–2', goal: 'Give a 2–3 minute prepared talk to 1–2 supportive people.', duration: '~2–3 weeks', readyWhen: 'You finish without major avoidance.' },
  { level: 11, title: '5-min presentation', goal: 'A ~5 minute presentation to a small, familiar group.', duration: '~3 weeks', readyWhen: 'The day-before anxiety feels manageable.' },
  { level: 12, title: 'Larger / formal talk', goal: 'A larger or more formal talk — a club like Toastmasters is ideal here.', duration: 'Ongoing', readyWhen: 'This becomes practice, not a final exam.' },
]

// Encouraging lines surfaced around the app. All grounded in the plan's voice.
export const ENCOURAGEMENTS: string[] = [
  'A stutter on the real word is a win. A smooth swap is the fear winning quietly.',
  'Silence is not an emergency. A calm pause reads as confidence.',
  'You’re not surrendering to the stutter — you’re disarming it.',
  'Success today: I spoke. I eased in. I stayed in the room.',
  'You can’t see their struggle. Fluency was never the scoreboard.',
  'Bumpy isn’t broken.',
  'Your job today is to speak, not to speak perfectly.',
  'Tiny and repeated beats big and rare.',
  'A racing heart isn’t fear — it can be your body getting ready.',
  'Less fear and less hiding is the win we’re after, even if the stutter is unchanged.',
  'Self-compassion isn’t soft — it’s what lets you stay in the arena.',
  'You already took the hardest step: deciding the old rules don’t get the final say.',
]

// Self-assessment worksheet fields (Plan: Part 1).
export const ASSESSMENT_FIELDS: { key: keyof SelfAssessmentForm; label: string; hint: string }[] = [
  { key: 'hardest_situations', label: 'My hardest situations', hint: 'e.g., phone calls, authority figures, group intros, being put on the spot' },
  { key: 'loaded_sounds', label: 'Sounds or words that feel “loaded”', hint: 'specific letters/sounds; certain words like my own name?' },
  { key: 'swap_habits', label: 'Do I swap words to avoid a hard one?', hint: 'How often? Which situations?' },
  { key: 'body_signals', label: 'My body’s signals before/during speaking', hint: 'heart rate, throat tightness, chest, jaw, breath held…' },
  { key: 'automatic_thoughts', label: 'My most common automatic thoughts', hint: 'write the exact sentences your mind produces' },
  { key: 'went_well', label: 'A time speaking went better than expected', hint: 'what helped?' },
  { key: 'went_badly', label: 'A time it went badly', hint: 'what made it worse?' },
  { key: 'support', label: 'My current support', hint: 'any SLP, therapist, supportive people I can practice with?' },
]

export interface SelfAssessmentForm {
  hardest_situations: string
  loaded_sounds: string
  swap_habits: string
  body_signals: string
  automatic_thoughts: string
  went_well: string
  went_badly: string
  support: string
}
