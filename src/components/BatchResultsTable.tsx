import type { BatchItem } from '../types'
import CategoryBadge from './CategoryBadge'

interface Props {
  results: BatchItem[]
}

export default function BatchResultsTable({ results }: Props) {
  if (!results.length) return null

  return (
    <div className="rounded-lg border border-[#e8ddd0] bg-[#faf7f4] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="section-label mb-1">Batch classification results</p>
          <h2 className="text-base font-semibold text-[#2c1f14]">Uploaded complaints</h2>
        </div>
        <p className="text-xs text-[#b09a8a]">{results.length} rows</p>
      </div>

      <div className="overflow-auto rounded-lg border border-[#e8ddd0] bg-white">
        <table className="min-w-full border-collapse text-left text-xs">
          <thead className="bg-[#f5f0ea] text-[#9e8a78]">
            <tr>
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Complaint</th>
              <th className="px-3 py-2 font-medium">Prediction</th>
              <th className="px-3 py-2 font-medium">Confidence</th>
              <th className="px-3 py-2 font-medium">Other models</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.index} className="border-t border-[#f0e8e0]">
                <td className="px-3 py-2 text-[#b09a8a]">{row.index + 1}</td>
                <td className="max-w-[320px] px-3 py-2 text-[#3d2f24]">
                  <div className="max-h-12 overflow-hidden">{row.original_text}</div>
                  <div className="mt-1 font-mono text-[10px] text-[#b09a8a]">{row.clean_text_preview}</div>
                </td>
                <td className="px-3 py-2">
                  <CategoryBadge category={row.category} size="sm" />
                </td>
                <td className="px-3 py-2 tabular-nums text-[#3d2f24]">
                  {(row.confidence * 100).toFixed(1)}%
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1.5">
                    {row.comparisons.slice(0, 3).map((p) => (
                      <span
                        key={p.model_name}
                        className="rounded border border-[#e8ddd0] bg-[#faf7f4] px-2 py-0.5 text-[10px] text-[#9e8a78]"
                      >
                        {p.model_name.split('_').join(' ')} · {p.category}
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
