// XP rewards for each tracked action
export const XP_REWARDS = {
  ROUTINE_TASK: 10,
  SWAP_WIN: 15,
  LADDER_ATTEMPT: 20,
  JOURNAL_SAVE: 25,
  BREATHING_SESSION: 10,
  THOUGHT_RECORD: 15,
  CHALLENGE_BRONZE: 30,
  CHALLENGE_SILVER: 50,
  CHALLENGE_GOLD: 75,
  WEEKLY_REVIEW: 50,
  PRACTICE_DRILL: 15,
  PRACTICE_SCENARIO: 30,
  PRACTICE_PROMPT: 20,
  SPEECH_SESSION: 25,
  AI_COACH_SESSION: 40,
} as const

export interface XpLevel {
  level: number
  title: string
  minXp: number
  maxXp: number
  colorClass: string
  barColor: string
}

export const XP_LEVELS: XpLevel[] = [
  { level: 1, title: 'Beginner',          minXp: 0,    maxXp: 99,    colorClass: 'text-slate-400',   barColor: 'from-slate-400 to-slate-500' },
  { level: 2, title: 'Explorer',           minXp: 100,  maxXp: 249,   colorClass: 'text-green-400',   barColor: 'from-green-400 to-emerald-500' },
  { level: 3, title: 'Practitioner',       minXp: 250,  maxXp: 499,   colorClass: 'text-brand-400',   barColor: 'from-brand-400 to-brand-500' },
  { level: 4, title: 'Steady Voice',       minXp: 500,  maxXp: 899,   colorClass: 'text-blue-400',    barColor: 'from-blue-400 to-sky-500' },
  { level: 5, title: 'Confident Speaker',  minXp: 900,  maxXp: 1499,  colorClass: 'text-purple-400',  barColor: 'from-purple-400 to-violet-500' },
  { level: 6, title: 'Master',             minXp: 1500, maxXp: 99999, colorClass: 'text-amber-400',   barColor: 'from-amber-400 to-orange-500' },
]

export function getXpLevel(xp: number): XpLevel {
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].minXp) return XP_LEVELS[i]
  }
  return XP_LEVELS[0]
}

export function getXpProgress(xp: number): number {
  const lvl = getXpLevel(xp)
  if (lvl.maxXp === 99999) return 1
  const range = lvl.maxXp - lvl.minXp + 1
  return Math.min((xp - lvl.minXp) / range, 1)
}

export function xpToNextLevel(xp: number): number {
  const lvl = getXpLevel(xp)
  if (lvl.maxXp === 99999) return 0
  return lvl.maxXp + 1 - xp
}

// ─── Daily Challenges ────────────────────────────────────────────────────────

export type ChallengeTier = 'bronze' | 'silver' | 'gold'

export interface Challenge {
  key: string
  text: string
  detail: string
  tier: ChallengeTier
  xp: number
  emoji: string
}

const BRONZE: Challenge[] = [
  { key: 'read-aloud',       text: 'Read aloud for 5 minutes',       detail: 'Read anything out loud — a book, article, or even a recipe — by yourself.', tier: 'bronze', xp: 30, emoji: '📖' },
  { key: 'record-30s',       text: 'Record yourself speaking',        detail: "Record 30 seconds of yourself talking about anything. You don't have to listen back.", tier: 'bronze', xp: 30, emoji: '🎙️' },
  { key: 'morning-prime',    text: 'Complete your morning prime',     detail: 'Do the morning regulation exercise before 10 AM to set the tone for your day.', tier: 'bronze', xp: 30, emoji: '🌅' },
  { key: 'breathe-calm',     text: 'Complete a breathing exercise',   detail: 'Do any breathing technique in the Calm section — even one round counts.', tier: 'bronze', xp: 30, emoji: '🌬️' },
  { key: 'journal-entry',    text: 'Write in your journal',           detail: "Complete today's evening reflection — even one sentence per prompt is enough.", tier: 'bronze', xp: 30, emoji: '📓' },
  { key: 'voluntary-stutter',text: 'Stutter on purpose once',         detail: 'Intentionally stutter on any word in any conversation today. This is a win.', tier: 'bronze', xp: 30, emoji: '🗣️' },
  { key: 'full-routine',     text: 'Complete all 5 routine tasks',    detail: "Check off every item in today's daily routine.", tier: 'bronze', xp: 30, emoji: '✅' },
]

const SILVER: Challenge[] = [
  { key: 'phone-call',       text: 'Make a phone call',               detail: 'Call anyone — a friend, family member, business, or service line.', tier: 'silver', xp: 50, emoji: '📞' },
  { key: 'say-anyway-3',     text: "Say 3 words you'd normally swap", detail: 'Find 3 moments today where you say the real word instead of avoiding or swapping it.', tier: 'silver', xp: 50, emoji: '🏆' },
  { key: 'introduce',        text: 'Introduce yourself to someone',   detail: 'Tell someone your name and one thing about yourself — in person or on a call.', tier: 'silver', xp: 50, emoji: '🤝' },
  { key: 'ask-question',     text: 'Ask a question out loud',         detail: 'Ask any question in a group, class, meeting, or shop today.', tier: 'silver', xp: 50, emoji: '❓' },
  { key: 'ladder-attempt',   text: 'Log an exposure ladder attempt',  detail: 'Do your current ladder level challenge and log it in the Exposure Ladder.', tier: 'silver', xp: 50, emoji: '🪜' },
  { key: 'reframe-thought',  text: 'Reframe an anxious thought',      detail: 'Write down one automatic thought and its reframe in the Reframe section.', tier: 'silver', xp: 50, emoji: '🧠' },
  { key: 'compliment',       text: 'Give someone a compliment aloud', detail: 'Say something genuinely positive to another person in real time, not over text.', tier: 'silver', xp: 50, emoji: '💛' },
]

const GOLD: Challenge[] = [
  { key: 'disclose',         text: 'Disclose your stutter to someone',     detail: 'Tell someone new "I stutter sometimes" before or during a conversation.', tier: 'gold', xp: 75, emoji: '⭐' },
  { key: 'avoided-call',     text: "Make the call you've been putting off", detail: "Make that one specific phone call you've been avoiding because of speaking anxiety.", tier: 'gold', xp: 75, emoji: '🔥' },
  { key: 'speak-in-group',   text: 'Speak in front of 3+ people',          detail: 'Say something — anything — when there are at least 3 people listening.', tier: 'gold', xp: 75, emoji: '🎤' },
  { key: 'feared-word-5',    text: 'Use your most feared word 5 times',    detail: 'Whatever word you avoid most — use it 5 times today in real conversations.', tier: 'gold', xp: 75, emoji: '💪' },
  { key: 'order-no-swap',    text: 'Order food without word-swapping',      detail: "At a coffee shop or restaurant — say exactly what you want, no word swaps.", tier: 'gold', xp: 75, emoji: '☕' },
  { key: 'share-opinion',    text: 'Share your actual opinion out loud',    detail: "In any group conversation, share what YOU genuinely think — don't just agree to avoid speaking.", tier: 'gold', xp: 75, emoji: '💬' },
  { key: 'meeting-question', text: 'Ask a question in a meeting or class',  detail: 'In a structured setting, raise your hand or unmute and ask a real question.', tier: 'gold', xp: 75, emoji: '🙋' },
]

export const CHALLENGE_POOL = { bronze: BRONZE, silver: SILVER, gold: GOLD }

export interface DailyChallenges {
  bronze: Challenge
  silver: Challenge
  gold: Challenge
}

/** Returns today's 3 challenges — one per tier, stable for the whole day. */
export function getTodaysChallenges(day: string): DailyChallenges {
  const n = day.replace(/-/g, '').split('').reduce((a, c) => a + parseInt(c, 10), 0)
  return {
    bronze: BRONZE[n % BRONZE.length],
    silver: SILVER[n % SILVER.length],
    gold:   GOLD[n % GOLD.length],
  }
}

export const TIER_META: Record<ChallengeTier, { label: string; emoji: string; bgClass: string; textClass: string; borderClass: string }> = {
  bronze: { label: 'Bronze', emoji: '🥉', bgClass: 'bg-amber-500/10',  textClass: 'text-amber-600 dark:text-amber-400',  borderClass: 'border-amber-500/30' },
  silver: { label: 'Silver', emoji: '🥈', bgClass: 'bg-slate-400/10',  textClass: 'text-slate-500 dark:text-slate-300',  borderClass: 'border-slate-400/30' },
  gold:   { label: 'Gold',   emoji: '🥇', bgClass: 'bg-yellow-400/10', textClass: 'text-yellow-600 dark:text-yellow-400', borderClass: 'border-yellow-500/30' },
}
