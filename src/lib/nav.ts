export type View =
  | 'dashboard'
  | 'challenges'
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
  { key: 'routine',    label: 'Daily routine' },
  { key: 'calm',       label: 'Calm tools' },
  { key: 'ladder',     label: 'Exposure ladder' },
  { key: 'swaps',      label: 'Word-swap lever' },
  { key: 'reframe',    label: 'Reframe' },
  { key: 'journal',    label: 'Journal' },
  { key: 'progress',   label: 'Progress' },
  { key: 'plan',       label: 'My plan' },
]
