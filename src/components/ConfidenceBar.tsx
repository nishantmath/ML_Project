import { CATEGORY_META } from './CategoryBadge'

// Explicit bar fill colours — must be static strings so Tailwind includes them
const BAR_COLOUR: Record<string, string> = {
  'Credit reporting':      'bg-violet-400',
  'Credit card / prepaid': 'bg-blue-400',
  'Bank account':          'bg-cyan-400',
  'Mortgage':              'bg-amber-400',
  'Debt collection':       'bg-rose-400',
  'Student loan':          'bg-green-400',
  'Loans':                 'bg-orange-400',
  'Money services':        'bg-teal-400',
  'Other':                 'bg-slate-400',
}

interface Props {
  category: string
  value: number        // 0–1
  isTop: boolean
  delay?: number
}

export default function ConfidenceBar({ category, value, isTop, delay = 0 }: Props) {
  const pct = Math.round(value * 100)
  const meta = CATEGORY_META[category]
  const barColour = isTop ? (BAR_COLOUR[category] ?? 'bg-indigo-400') : 'bg-slate-600'

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      role="group"
      aria-label={`${category}: ${pct}%`}
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {meta && <span className="text-sm" aria-hidden="true">{meta.icon}</span>}
          <span className={`truncate text-xs font-medium ${isTop ? 'text-slate-200' : 'text-slate-400'}`}>
            {category}
          </span>
          {isTop && (
            <span className="shrink-0 rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-300">
              TOP
            </span>
          )}
        </div>
        <span className={`shrink-0 text-xs font-semibold tabular-nums ${isTop ? 'text-white' : 'text-slate-500'}`}>
          {pct}%
        </span>
      </div>

      <div
        className="h-2 w-full overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${barColour} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  )
}
