import { CATEGORY_META } from './CategoryBadge'

const BAR_COLOUR: Record<string, string> = {
  'Credit reporting':      'bg-violet-400',
  'Credit card / prepaid': 'bg-blue-400',
  'Bank account':          'bg-cyan-400',
  'Mortgage':              'bg-amber-400',
  'Debt collection':       'bg-rose-400',
  'Student loan':          'bg-emerald-400',
  'Loans':                 'bg-orange-400',
  'Money services':        'bg-teal-400',
  'Other':                 'bg-slate-400',
}

interface Props {
  category: string
  value: number
  isTop: boolean
  delay?: number
}

export default function ConfidenceBar({ category, value, isTop, delay = 0 }: Props) {
  const pct = Math.round(value * 100)
  const meta = CATEGORY_META[category]
  const barColour = isTop ? (BAR_COLOUR[category] ?? 'bg-slate-400') : 'bg-slate-700'

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      role="group"
      aria-label={`${category}: ${pct}%`}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {meta && <span className="text-xs" aria-hidden="true">{meta.icon}</span>}
          <span className={`truncate text-xs ${isTop ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
            {category}
          </span>
        </div>
        <span className={`shrink-0 tabular-nums text-xs ${isTop ? 'text-slate-300 font-medium' : 'text-slate-600'}`}>
          {pct}%
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full ${barColour} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%`, transitionDelay: `${delay}ms` }}
        />
      </div>
    </div>
  )
}
