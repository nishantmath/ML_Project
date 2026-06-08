import type { PredictResponse } from '../types'
import CategoryBadge, { CATEGORY_META } from './CategoryBadge'
import ProbabilityChart from './ProbabilityChart'
import ConfidenceRing from './ConfidenceRing'

interface Props { result: PredictResponse }

export default function ResultCard({ result }: Props) {
  const meta = CATEGORY_META[result.category] ?? CATEGORY_META['Other']
  const comparisonRows = result.comparisons ?? []

  return (
    <div className="animate-fade-up rounded-lg border border-[#2e2820] bg-[#211e19] p-5">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#3d342c] bg-[#2a2520] text-xl">
            {meta.icon}
          </div>
          <div>
            <p className="section-label mb-1.5">Predicted category</p>
            <CategoryBadge category={result.category} size="lg" />
            <p className="mt-1.5 text-xs text-[#4a3d32]">
              via <span className="text-[#8a7060]">{result.selected_model.split('_').join(' ')}</span>
            </p>
          </div>
        </div>
        <ConfidenceRing value={result.confidence} />
      </div>

      <div className="mb-4 h-px bg-[#2e2820]" />

      <div className="mb-4">
        <p className="section-label mb-3">Category breakdown</p>
        <ProbabilityChart probabilities={result.all_probabilities} topCategory={result.category} />
      </div>

      <div className="mb-4 h-px bg-[#2e2820]" />

      <details className="group">
        <summary className="flex cursor-pointer select-none items-center gap-1.5 section-label hover:text-[#8a7060] transition">
          <svg className="h-3 w-3 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          Preprocessed text
        </summary>
        <div className="mt-2 rounded-lg border border-[#2e2820] bg-[#191612] p-3">
          <p className="font-mono text-[11px] leading-relaxed text-[#6b5c4e]">
            {result.clean_text_preview}
            {result.clean_text_preview.length === 300 && <span className="text-[#3d342c]"> …</span>}
          </p>
        </div>
      </details>

      {comparisonRows.length > 0 && (
        <>
          <div className="my-4 h-px bg-[#2e2820]" />
          <div>
            <p className="section-label mb-2.5">Model comparison</p>
            <div className="space-y-1.5">
              {comparisonRows.map((p) => (
                <div key={p.model_name}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs ${
                    p.model_name === result.selected_model
                      ? 'border-[#c96442]/30 bg-[#c96442]/8 text-[#e8ddd0]'
                      : 'border-[#2e2820] bg-transparent text-[#6b5c4e]'
                  }`}
                >
                  <span>{p.model_name.split('_').join(' ')}</span>
                  <span className="tabular-nums">{p.category} · {(p.confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
