import type { HealthResponse, MetricsResponse } from '../types'

interface Props {
  metrics: MetricsResponse | null
  health: HealthResponse | null
  selectedModel: string
  onSelectModel: (model: string) => void
}

const metricLabels = [
  { key: 'accuracy',  label: 'Accuracy'  },
  { key: 'precision', label: 'Precision' },
  { key: 'recall',    label: 'Recall'    },
  { key: 'f1',        label: 'F1'        },
]

export default function ModelMetricsPanel({ metrics, health, selectedModel, onSelectModel }: Props) {
  if (!metrics) {
    return (
      <div className="rounded-lg border border-[#2a2d31] bg-[#1c1e21] p-6">
        <p className="text-sm text-[#555d66]">Loading evaluation dashboard…</p>
      </div>
    )
  }

  const selected = metrics.models[selectedModel] ?? metrics.models[metrics.best_model]
  const matrix = selected?.confusion_matrix ?? []
  const labels = metrics.categories

  return (
    <div className="rounded-lg border border-[#2a2d31] bg-[#1c1e21] p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-label mb-1">Evaluation dashboard</p>
          <h2 className="text-base font-semibold text-[#e4e6e9]">Model comparison and monitoring</h2>
        </div>
        {health && (
          <div className="rounded-lg border border-[#2a2d31] bg-[#17191c] px-4 py-3 text-xs text-[#555d66]">
            <div className="font-semibold text-[#c0c4ca]">Status: {health.status}</div>
            <div>Version: {health.model_version}</div>
            <div>Uptime: {Math.round(health.uptime_seconds)}s</div>
          </div>
        )}
      </div>

      {/* Model cards */}
      <div className="mb-5 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {Object.entries(metrics.models).map(([name, row]) => (
          <button key={name} onClick={() => onSelectModel(name)}
            className={`rounded-lg border p-3.5 text-left transition ${
              selectedModel === name
                ? 'border-[#c96442]/40 bg-[#c96442]/8'
                : 'border-[#2a2d31] bg-[#17191c] hover:border-[#3a3d42]'
            }`}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[#e4e6e9]">{name.split('_').join(' ')}</span>
              {metrics.best_model === name && (
                <span className="rounded bg-emerald-900/50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">Best</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {metricLabels.map((metric) => (
                <div key={metric.key} className="rounded bg-[#111214] px-2 py-1">
                  <div className="text-[10px] uppercase tracking-wide text-[#404850]">{metric.label}</div>
                  <div className="font-semibold text-[#c0c4ca]">
                    {((row as unknown as Record<string, number>)[metric.key] * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Confusion matrix */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <p className="section-label">Confusion matrix — {selectedModel.split('_').join(' ')}</p>
            <p className="text-xs text-[#404850]">Support: {selected?.support ?? 0}</p>
          </div>
          <div className="overflow-auto rounded-lg border border-[#2a2d31] bg-[#17191c]">
            <table className="min-w-full border-collapse text-left text-xs">
              <thead className="bg-[#111214] text-[#555d66]">
                <tr>
                  <th className="px-3 py-2 font-medium">Actual \ Predicted</th>
                  {labels.map((label) => <th key={label} className="px-3 py-2 font-medium">{label}</th>)}
                </tr>
              </thead>
              <tbody>
                {matrix.map((row, ri) => (
                  <tr key={labels[ri] ?? ri} className="border-t border-[#1e2124]">
                    <th className="bg-[#1a1c1f] px-3 py-2 font-medium text-[#7a8390]">{labels[ri] ?? ri}</th>
                    {row.map((val, ci) => (
                      <td key={`${ri}-${ci}`} className="px-3 py-2 text-[#c0c4ca]">{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monitoring */}
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
    <div className="rounded-lg border border-[#2a2d31] bg-[#17191c] px-4 py-3">
      <p className="section-label">{label}</p>
      <p className="mt-0.5 text-xl font-semibold text-[#e4e6e9]">{value}</p>
    </div>
  )
}
