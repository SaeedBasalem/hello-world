// Row types mirroring the `sc_*` tables in Supabase.

export interface Profile {
  id: string
  display_name: string | null
  current_level: number
  onboarded: boolean
  created_at: string
  updated_at: string
}

export interface SelfAssessment {
  user_id: string
  hardest_situations: string | null
  loaded_sounds: string | null
  swap_habits: string | null
  body_signals: string | null
  automatic_thoughts: string | null
  went_well: string | null
  went_badly: string | null
  support: string | null
  updated_at: string
}

export interface RoutineDay {
  id: string
  user_id: string
  day: string // YYYY-MM-DD
  morning_prime: boolean
  easy_reading: boolean
  voluntary_stutter: boolean
  real_rep: boolean
  evening_reflect: boolean
  created_at: string
  updated_at: string
}

export type RoutineTask =
  | 'morning_prime'
  | 'easy_reading'
  | 'voluntary_stutter'
  | 'real_rep'
  | 'evening_reflect'

export interface JournalEntry {
  id: string
  user_id: string
  day: string
  win: string | null
  hard_moment: string | null
  response: string | null
  try_tomorrow: string | null
  note: string | null
  anxiety_rating: number | null
  created_at: string
}

export interface LadderAttempt {
  id: string
  user_id: string
  level: number
  anxiety_before: number | null
  anxiety_after: number | null
  success: boolean
  notes: string | null
  created_at: string
}

export interface SwapEvent {
  id: string
  user_id: string
  day: string
  said_anyway: boolean
  word: string | null
  situation: string | null
  created_at: string
}

export interface BreathingSession {
  id: string
  user_id: string
  technique: string
  duration_seconds: number | null
  anxiety_before: number | null
  anxiety_after: number | null
  created_at: string
}

export interface ThoughtRecord {
  id: string
  user_id: string
  situation: string | null
  automatic_thought: string | null
  distortion: string | null
  reframe: string | null
  created_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_start: string
  confidence: number | null
  anxiety: number | null
  ease: number | null
  comfort: number | null
  swap_count: number | null
  routine_days: number | null
  best_moment: string | null
  hardest_moment: string | null
  learned: string | null
  adjust: string | null
  created_at: string
  updated_at: string
}
