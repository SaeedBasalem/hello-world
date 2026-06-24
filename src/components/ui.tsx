import type { ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return <div className={`card p-5 sm:p-6 ${className}`}>{children}</div>
}

export function SectionTitle({
  title,
  subtitle,
  icon,
  right,
}: {
  title: string
  subtitle?: string
  icon?: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  )
}

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-ink-faint">
      <Loader2 className="h-5 w-5 animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  )
}

export function EmptyState({ icon, title, body }: { icon?: ReactNode; title: string; body?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 px-6 py-10 text-center">
      {icon && <div className="mb-3 text-brand-300">{icon}</div>}
      <p className="font-semibold text-ink">{title}</p>
      {body && <p className="mt-1 max-w-sm text-sm text-ink-soft">{body}</p>}
    </div>
  )
}

const SCALE_COLORS = [
  'bg-emerald-500',
  'bg-emerald-500',
  'bg-green-500',
  'bg-lime-500',
  'bg-yellow-400',
  'bg-amber-400',
  'bg-amber-500',
  'bg-orange-500',
  'bg-orange-600',
  'bg-red-500',
  'bg-red-600',
]

/** The 0–10 anxiety scale used throughout the plan. */
export function AnxietyScale({
  value,
  onChange,
  label = 'Anxiety right now',
}: {
  value: number | null
  onChange: (v: number) => void
  label?: string
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-soft">{label}</span>
        <span className="text-xs text-ink-faint">0 calm · 10 overwhelming</span>
      </div>
      <div className="grid grid-cols-11 gap-1">
        {Array.from({ length: 11 }, (_, i) => {
          const active = value === i
          return (
            <button
              key={i}
              type="button"
              onClick={() => onChange(i)}
              aria-label={`${i} out of 10`}
              className={`aspect-square rounded-lg text-xs font-semibold transition ${
                active
                  ? `${SCALE_COLORS[i]} text-white ring-2 ring-offset-1 ring-ink/20 scale-105`
                  : 'bg-slate-100 text-ink-soft hover:bg-slate-200'
              }`}
            >
              {i}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function Pill({
  children,
  tone = 'brand',
}: {
  children: ReactNode
  tone?: 'brand' | 'warm' | 'slate' | 'green'
}) {
  const tones: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-700',
    warm: 'bg-warm-100 text-warm-600',
    slate: 'bg-slate-100 text-ink-soft',
    green: 'bg-emerald-50 text-emerald-700',
  }
  return <span className={`chip ${tones[tone]}`}>{children}</span>
}

export function ProgressRing({
  value,
  size = 56,
  stroke = 6,
  children,
}: {
  value: number // 0..1
  size?: number
  stroke?: number
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.max(0, Math.min(1, value)))
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e2e8f0" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          className="text-brand-500 transition-all duration-500"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          fill="none"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
