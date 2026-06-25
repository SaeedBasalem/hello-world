export type View =
  | 'dashboard'
  | 'challenges'
  | 'practice'
  | 'tracker'
  | 'coach'
  | 'routine'
  | 'calm'
  | 'ladder'
  | 'swaps'
  | 'reframe'
  | 'journal'
  | 'progress'
  | 'plan'

export interface NavItem {
  key: View
  label: string
}

export const NAV: NavItem[] = [
  { key: 'dashboard',  label: 'Home' },
  { key: 'challenges', label: 'Challenges' },
  { key: 'practice',   label: 'Practice' },
  { key: 'tracker',    label: 'Speech Lab' },
  { key: 'coach',      label: 'AI Coach' },
  { key: 'routine',    label: 'Daily routine' },
  { key: 'calm',       label: 'Calm tools' },
  { key: 'ladder',     label: 'Exposure ladder' },
  { key: 'swaps',      label: 'Word-swap lever' },
  { key: 'reframe',    label: 'Reframe' },
  { key: 'journal',    label: 'Journal' },
  { key: 'progress',   label: 'Progress' },
  { key: 'plan',       label: 'My plan' },
]
