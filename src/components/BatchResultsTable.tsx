import type { BatchItem } from '../types'
import CategoryBadge from './CategoryBadge'

interface Props {
  results: BatchItem[]
}

export default function BatchResultsTable({ results }: Props) {
  if (!results.length) return null

  return (
    <div className="gradient-border rounded-2xl bg-surface-raised p-6 shadow-xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Batch classification results
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">Uploaded complaints</h2>
        </div>
        <p className="text-xs text-slate-500">{results.length} rows</p>
      </div>

      <div className="overflow-auto rounded-xl border border-slate-800 bg-slate-950/50">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-3 py-2">#</th>
              <th className="px-3 py-2">Complaint</th>
              <th className="px-3 py-2">Prediction</th>
              <th className="px-3 py-2">Confidence</th>
              <th className="px-3 py-2">Other models</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.index} className="border-t border-slate-800/80">
                <td className="px-3 py-2 text-slate-500">{row.index + 1}</td>
                <td className="max-w-[320px] px-3 py-2 text-slate-300">
                  <div className="max-h-12 overflow-hidden">{row.original_text}</div>
                  <div className="mt-1 font-mono text-[10px] text-slate-600">{row.clean_text_preview}</div>
                </td>
                <td className="px-3 py-2">
                  <CategoryBadge category={row.category} size="sm" />
                </td>
                <td className="px-3 py-2 text-slate-200">
                  {(row.confidence * 100).toFixed(1)}%
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    {row.comparisons.slice(0, 3).map((prediction) => (
                      <span
                        key={prediction.model_name}
                        className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] text-slate-400"
                      >
                        {prediction.model_name.split('_').join(' ')} · {prediction.category}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
