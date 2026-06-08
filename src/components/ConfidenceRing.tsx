interface Props { value: number }

function ringColour(v: number) {
  if (v >= 0.75) return { stroke: '#34d399', label: 'High confidence',     labelClass: 'text-emerald-400' }
  if (v >= 0.50) return { stroke: '#fbbf24', label: 'Moderate confidence', labelClass: 'text-amber-400'   }
  return              { stroke: '#f87171', label: 'Low confidence',        labelClass: 'text-red-400'     }
}

export default function ConfidenceRing({ value }: Props) {
  const pct = Math.round(value * 100)
  const { stroke, label, labelClass } = ringColour(value)
  const r = 40
  const circ = 2 * Math.PI * r
  const dash = (value * circ).toFixed(1)

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative h-24 w-24">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#2e2820" strokeWidth="7" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={stroke} strokeWidth="7"
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-[#e8ddd0]">{pct}%</span>
        </div>
      </div>
      <span className={`text-xs font-medium ${labelClass}`}>{label}</span>
    </div>
  )
}
