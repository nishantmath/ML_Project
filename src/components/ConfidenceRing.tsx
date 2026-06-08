interface Props {
  value: number
}

function ringColour(v: number) {
  if (v >= 0.75) return { stroke: '#059669', label: 'High confidence',     labelClass: 'text-emerald-600' }
  if (v >= 0.50) return { stroke: '#d97706', label: 'Moderate confidence', labelClass: 'text-amber-600'   }
  return              { stroke: '#dc2626', label: 'Low confidence',        labelClass: 'text-red-600'     }
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
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e8ddd0" strokeWidth="7" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.7s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-semibold text-[#2c1f14]">{pct}%</span>
        </div>
      </div>
      <span className={`text-xs font-medium ${labelClass}`}>{label}</span>
    </div>
  )
}
