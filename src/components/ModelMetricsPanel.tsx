import type { HealthResponse, MetricsResponse } from '../types'

interface Props {
  metrics: MetricsResponse | null
  health: HealthResponse | null
  selectedModel: string
  onSelectModel: (model: string) => void
}

const metricLabels = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'precision', label: 'Precision' },
  { key: 'recall', label: 'Recall' },
  { key: 'f1', label: 'F1' },
]

export default function ModelMetricsPanel({
  metrics,
  health,
  selectedModel,
  onSelectModel,
}: Props) {
  if (!metrics) {
    return (
      <div className="rounded-lg border border-[#e8ddd0] bg-[#faf7f4] p-6">
        <p className="text-sm text-[#9e8a78]">Loading evaluation dashboard…</p>
      </div>
    )
  }

  const selected = metrics.models[selectedModel] ?? metrics.models[metrics.best_model]
  const matrix = selected?.confusion_matrix ?? []
  const labels = metrics.categories

  return (
    <div className="rounded-lg border border-[#e8ddd0] bg-[#faf7f4] p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-label mb-1">Evaluation dashboard</p>
          <h2 className="text-base font-semibold text-[#2c1f14]">Model comparison and monitoring</h2>
        </div>
        {health && (
          <div className="rounded-lg border border-[#e0d4c8] bg-white px-4 py-3 text-xs text-[#9e8a78]">
            <div className="font-semibold text-[#3d2f24]">Status: {health.status}</div>
            <div>Version: {health.model_version}</div>
            <div>Uptime: {Math.round(health.uptime_seconds)}s</div>
          </div>
        )}
      </div>

      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(metrics.models).map(([name, row]) => (
          <button
            key={name}
            onClick={() => onSelectModel(name)}
            className={`rounded-lg border p-3.5 text-left transition hover:border-[#c96442]/40 ${
              selectedModel === name
                ? 'border-[#c96442]/40 bg-[#c96442]/5'
                : 'border-[#e8ddd0] bg-white'
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#2c1f14]">{name.split('_').join(' ')}</span>
              {metrics.best_model === name && (
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                  Best
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {metricLabels.map((metric) => (
                <div key={metric.key} className="rounded bg-[#f5f0ea] px-2 py-1">
                  <div className="text-[10px] uppercase tracking-wide text-[#b09a8a]">{metric.label}</div>
                  <div className="font-semibold text-[#3d2f24]">
                    {((row as unknown as Record<string, number>)[metric.key] * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="section-label">Confusion matrix — {selectedModel.split('_').join(' ')}</p>
            <p className="text-xs text-[#b09a8a]">Support: {selected?.support ?? 0}</p>
          </div>
          <div className="overflow-auto rounded-lg border border-[#e8ddd0] bg-white">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-[#f5f0ea] text-[#9e8a78]">
                <tr>
                  <th className="px-3 py-2 font-medium">Actual \ Predicted</th>
                  {labels.map((label) => (
                    <th key={label} className="px-3 py-2 font-medium">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, rowIndex) => (
                  <tr key={labels[rowIndex] ?? rowIndex} className="border-t border-[#f0e8e0]">
                    <th className="bg-[#faf7f4] px-3 py-2 font-medium text-[#4a3728]">
                      {labels[rowIndex] ?? rowIndex}
                    </th>
                    {row.map((value, colIndex) => (
                      <td key={`${rowIndex}-${colIndex}`} className="px-3 py-2 text-[#3d2f24]">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-2.5">
          <p className="section-label">Monitoring snapshot</p>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <Stat label="Requests"    value={health?.request_count ?? 0} />
            <Stat label="Predictions" value={health?.prediction_count ?? 0} />
            <Stat label="Batch jobs"  value={health?.batch_count ?? 0} />
            <Stat label="Models"      value={metrics ? Object.keys(metrics.models).length : 0} />
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[#e8ddd0] bg-white px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-[#b09a8a]">{label}</p>
      <p className="mt-0.5 text-xl font-semibold text-[#2c1f14]">{value}</p>
    </div>
  )
}
