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
      <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6">
        <p className="text-sm text-slate-400">Loading evaluation dashboard…</p>
      </div>
    )
  }

  const selected = metrics.models[selectedModel] ?? metrics.models[metrics.best_model]
  const matrix = selected?.confusion_matrix ?? []
  const labels = metrics.categories

  return (
    <div className="gradient-border rounded-2xl bg-surface-raised p-6 shadow-xl">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Evaluation dashboard
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Model comparison and monitoring
          </h2>
        </div>
        {health && (
          <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-xs text-slate-400">
            <div className="font-semibold text-slate-200">System status: {health.status}</div>
            <div>Version: {health.model_version}</div>
            <div>Uptime: {Math.round(health.uptime_seconds)}s</div>
          </div>
        )}
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(metrics.models).map(([name, row]) => (
          <button
            key={name}
            onClick={() => onSelectModel(name)}
            className={`rounded-xl border p-4 text-left transition hover:border-indigo-500/40 ${
              selectedModel === name
                ? 'border-indigo-500/50 bg-indigo-500/10'
                : 'border-slate-800 bg-slate-950/40'
            }`}
          >
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-white">{name.split('_').join(' ')}</span>
              {metrics.best_model === name && (
                <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                  Best
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
              {metricLabels.map((metric) => (
                <div key={metric.key} className="rounded-lg bg-slate-900/60 px-2 py-1">
                  <div className="text-[10px] uppercase tracking-wide text-slate-600">{metric.label}</div>
                  <div className="font-semibold text-slate-200">
                    {((row as unknown as Record<string, number>)[metric.key] * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Confusion matrix — {selectedModel.split('_').join(' ')}
            </p>
            <p className="text-xs text-slate-500">
              Support: {selected?.support ?? 0}
            </p>
          </div>
          <div className="overflow-auto rounded-xl border border-slate-800 bg-slate-950/50">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-3 py-2">Actual \\ Predicted</th>
                  {labels.map((label) => (
                    <th key={label} className="px-3 py-2 font-medium">
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, rowIndex) => (
                  <tr key={labels[rowIndex] ?? rowIndex} className="border-t border-slate-800/80">
                    <th className="bg-slate-900/40 px-3 py-2 font-medium text-slate-300">
                      {labels[rowIndex] ?? rowIndex}
                    </th>
                    {row.map((value, colIndex) => (
                      <td key={`${rowIndex}-${colIndex}`} className="px-3 py-2 text-slate-200">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Monitoring snapshot
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <Stat label="Requests" value={health?.request_count ?? 0} />
            <Stat label="Predictions" value={health?.prediction_count ?? 0} />
            <Stat label="Batch jobs" value={health?.batch_count ?? 0} />
            <Stat label="Models" value={metrics ? Object.keys(metrics.models).length : 0} />
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-xs text-slate-400">
            Use the model cards above to compare evaluation scores. The confusion matrix updates
            with the selected model so you can see where it confuses classes.
          </div>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <p className="text-[10px] uppercase tracking-widest text-slate-600">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  )
}
