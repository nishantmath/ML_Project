interface Props {
  value: number   // 0–1
}

function ringColour(v: number) {
  if (v >= 0.75) return { stroke: '#10b981', label: 'High confidence',     labelClass: 'text-emerald-400' }
  if (v >= 0.50) return { stroke: '#f59e0b', label: 'Moderate confidence', labelClass: 'text-amber-400'   }
  return              { stroke: '#f43f5e', label: 'Low confidence',        labelClass: 'text-rose-400'    }
}

export default function ConfidenceRing({ value }: Props) {
  const pct = Math.round(value * 100)
  const { stroke, label, labelClass } = ringColour(value)

  const r = 44
  const circ = 2 * Math.PI * r
  const dash = (value * circ).toFixed(1)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-28 w-28">
        {/* Track */}
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
          <circle
            cx="50" cy="50" r={r}
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}
          />
        </svg>
        {/* Centre text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{pct}%</span>
        </div>
      </div>
      <span className={`text-xs font-medium ${labelClass}`}>{label}</span>
    </div>
  )
}
