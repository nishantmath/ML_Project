import type { PredictResponse } from '../types'
import CategoryBadge, { CATEGORY_META } from './CategoryBadge'
import ProbabilityChart from './ProbabilityChart'
import ConfidenceRing from './ConfidenceRing'

interface Props {
  result: PredictResponse
}

export default function ResultCard({ result }: Props) {
  const meta = CATEGORY_META[result.category] ?? CATEGORY_META['Other']
  const comparisonRows = result.comparisons ?? []

  return (
    <div className={`animate-fade-up gradient-border rounded-2xl bg-surface-raised p-6 shadow-2xl ${meta.glow} shadow-lg`}>

      {/* ── Top section: icon + category + ring ── */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-3">
          {/* Big icon */}
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl ${meta.bg} ${meta.border}`}>
            {meta.icon}
          </div>
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Predicted Category
            </p>
            <CategoryBadge category={result.category} size="lg" />
            <p className="mt-2 text-xs text-slate-500">
              Model: <span className="font-medium text-slate-300">{result.selected_model.split('_').join(' ')}</span>
            </p>
          </div>
        </div>

        <ConfidenceRing value={result.confidence} />
      </div>

      {/* ── Divider ── */}
      <div className="mb-5 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* ── Probability breakdown ── */}
      <div className="mb-5">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
          Category Breakdown
        </p>
        <ProbabilityChart
          probabilities={result.all_probabilities}
          topCategory={result.category}
        />
      </div>

      {/* ── Divider ── */}
      <div className="mb-4 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />

      {/* ── Preprocessed text ── */}
      <details className="group">
        <summary className="flex cursor-pointer select-none items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500 transition hover:text-slate-300">
          <svg className="h-3.5 w-3.5 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Preprocessed text
        </summary>
        <div className="mt-3 rounded-xl border border-slate-700/50 bg-slate-900/80 p-4">
          <p className="font-mono text-[11px] leading-relaxed text-slate-400">
            {result.clean_text_preview}
            {result.clean_text_preview.length === 300 && (
              <span className="text-slate-600"> …</span>
            )}
          </p>
        </div>
      </details>

      {comparisonRows.length > 0 && (
        <>
          <div className="my-5 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Model comparison
            </p>
            <div className="grid gap-2">
              {comparisonRows.map((prediction) => (
                <div
                  key={prediction.model_name}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2 text-xs ${
                    prediction.model_name === result.selected_model
                      ? 'border-indigo-500/40 bg-indigo-500/10'
                      : 'border-slate-800 bg-slate-950/40'
                  }`}
                >
                  <span className="font-medium text-slate-300">
                    {prediction.model_name.split('_').join(' ')}
                  </span>
                  <span className="text-slate-400">
                    {prediction.category} · {(prediction.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
