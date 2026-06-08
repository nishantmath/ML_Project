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
  'Other':                 'bg-zinc-400',
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
  const barColour = isTop ? (BAR_COLOUR[category] ?? 'bg-zinc-400') : 'bg-[#2a2d31]'

  return (
    <div style={{ animationDelay: `${delay}ms` }} role="group" aria-label={`${category}: ${pct}%`}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          {meta && <span className="text-xs" aria-hidden="true">{meta.icon}</span>}
          <span className={`truncate text-xs ${isTop ? 'font-medium text-[#e4e6e9]' : 'text-[#555d66]'}`}>
            {category}
          </span>
        </div>
        <span className={`shrink-0 tabular-nums text-xs ${isTop ? 'font-medium text-[#c0c4ca]' : 'text-[#404850]'}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#2a2d31]"
        role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className={`h-full rounded-full ${barColour} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%`, transitionDelay: `${delay}ms` }} />
      </div>
    </div>
  )
}
