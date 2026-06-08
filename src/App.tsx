import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { classify, classifyBatch, getHealth, getMetrics } from './api'
import type {
  BatchPredictResponse,
  HealthResponse,
  MetricsResponse,
  PredictResponse,
} from './types'
import ResultCard from './components/ResultCard'
import SampleComplaints from './components/SampleComplaints'
import ModelMetricsPanel from './components/ModelMetricsPanel'
import BatchResultsTable from './components/BatchResultsTable'
import NavBar from './components/NavBar'

const MIN_CHARS = 20
const MAX_CHARS = 5000
const MAX_BATCH_COUNT = 100
const DEFAULT_MODELS = ['linear_svm', 'logistic_regression', 'multinomial_nb', 'random_forest']

type Status = 'idle' | 'loading' | 'success' | 'error'
type BatchStatus = 'idle' | 'loading' | 'success' | 'error'

export default function App() {
  const [text, setText] = useState('')
  const [selectedModel, setSelectedModel] = useState('best')
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null)
  const [uptime, setUptime] = useState<number | null>(null)
  // Stores the wall-clock time at which the health snapshot was taken,
  // plus the server uptime at that moment. The displayed uptime is:
  //   uptimeAtFetch + (Date.now() - fetchedAt) / 1000
  const uptimeBaseRef = useRef<{ uptimeAtFetch: number; fetchedAt: number } | null>(null)
  const [batchStatus, setBatchStatus] = useState<BatchStatus>('idle')
  const [batchResults, setBatchResults] = useState<BatchPredictResponse | null>(null)
  const [batchError, setBatchError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void Promise.allSettled([getHealth(), getMetrics()]).then(([healthResult, metricsResult]) => {
      if (healthResult.status === 'fulfilled') {
        const h = healthResult.value
        setHealth(h)
        // Anchor the live uptime counter to the server value + fetch timestamp
        uptimeBaseRef.current = { uptimeAtFetch: h.uptime_seconds, fetchedAt: Date.now() }
        setUptime(Math.round(h.uptime_seconds))
      }
      if (metricsResult.status === 'fulfilled') {
        setMetrics(metricsResult.value)
      }
    })
  }, [])

  // Tick uptime every second using the local clock — no extra network requests
  useEffect(() => {
    const id = setInterval(() => {
      if (!uptimeBaseRef.current) return
      const { uptimeAtFetch, fetchedAt } = uptimeBaseRef.current
      const elapsed = (Date.now() - fetchedAt) / 1000
      setUptime(Math.round(uptimeAtFetch + elapsed))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const availableModels = useMemo(() => {
    const fromHealth = health?.available_models ?? []
    const merged = new Set(['best', ...DEFAULT_MODELS, ...fromHealth])
    return Array.from(merged)
  }, [health])

  const resolvedModel = selectedModel === 'best' ? undefined : selectedModel
  const charCount = text.length
  const canSubmit = charCount >= MIN_CHARS && charCount <= MAX_CHARS && status !== 'loading'

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return
    setStatus('loading')
    setResult(null)
    setErrorMsg('')
    try {
      const data = await classify(text, resolvedModel)
      setResult(data)
      setStatus('success')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An unexpected error occurred.')
      setStatus('error')
    }
  }, [text, canSubmit, resolvedModel])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault()
      void handleSubmit()
    }
  }

  const handleSampleSelect = (sample: string) => {
    setText(sample)
    setResult(null)
    setStatus('idle')
    setErrorMsg('')
    textareaRef.current?.focus()
  }

  const handleClear = () => {
    setText('')
    setResult(null)
    setStatus('idle')
    setErrorMsg('')
    textareaRef.current?.focus()
  }

  const handleBatchUpload = async (file: File) => {
    setBatchError('')
    setBatchResults(null)
    setBatchStatus('loading')
    try {
      const contents = await file.text()
      const texts = extractComplaints(contents).slice(0, MAX_BATCH_COUNT)
      if (!texts.length) {
        throw new Error('No valid complaints found in the uploaded file.')
      }
      const data = await classifyBatch(texts, resolvedModel)
      setBatchResults(data)
      setBatchStatus('success')
    } catch (err) {
      setBatchError(err instanceof Error ? err.message : 'Batch classification failed.')
      setBatchStatus('error')
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1814]">
      <NavBar />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <p className="section-label mb-2">CFPB · Consumer Financial Protection Bureau</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#e8ddd0] sm:text-4xl">
            Complaint Classifier
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#6b5c4e]">
            Multi-model CFPB complaint analysis — prediction, batch upload, evaluation metrics, and monitoring.
          </p>
        </header>

        <div className="mb-6 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat label="Best model"    value={health?.best_model ?? metrics?.best_model ?? '—'} />
          <MiniStat label="Version"       value={health?.model_version ?? '—'} />
          <MiniStat label="Uptime"        value={uptime !== null ? formatUptime(uptime) : '—'} />
          <MiniStat label="Active models" value={health?.available_models.length ?? 0} />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-[#2e2820] bg-[#211e19] p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="section-label mb-1">Single complaint analysis</p>
                  <h2 className="text-base font-semibold text-[#e8ddd0]">Predict and compare models</h2>
                </div>
                <div className="text-xs text-[#6b5c4e]">
                  Model
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {availableModels.map((model) => (
                      <button key={model} type="button" onClick={() => setSelectedModel(model)}
                        className={`rounded border px-2.5 py-1 text-xs transition ${
                          selectedModel === model
                            ? 'border-[#c96442]/60 bg-[#c96442]/15 text-[#e8a882] font-medium'
                            : 'border-[#2e2820] bg-transparent text-[#6b5c4e] hover:border-[#3d342c] hover:text-[#8a7060]'
                        }`}
                      >
                        {model === 'best' ? 'Best model' : model.split('_').join(' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                id="complaint-input" ref={textareaRef} value={text}
                onChange={(e) => { setText(e.target.value.slice(0, MAX_CHARS)); if (status === 'error') setStatus('idle') }}
                onKeyDown={handleKeyDown} rows={9}
                placeholder="Describe the consumer complaint in detail..."
                className="w-full resize-none rounded-lg border border-[#2e2820] bg-[#191612] px-3.5 py-3 text-sm leading-relaxed text-[#e8ddd0] placeholder-[#3d342c] transition focus:border-[#c96442]/50 focus:outline-none focus:ring-1 focus:ring-[#c96442]/20"
                aria-describedby="char-count"
              />

              <div className="mt-2.5 flex flex-wrap items-center justify-between gap-3">
                <span id="char-count" className={`text-xs tabular-nums ${charCount > MAX_CHARS * 0.9 ? 'text-amber-400' : 'text-[#3d342c]'}`}>
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                  {charCount > 0 && charCount < MIN_CHARS && (
                    <span className="ml-2 text-rose-400">({MIN_CHARS - charCount} more needed)</span>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  {text.length > 0 && (
                    <button onClick={handleClear} className="rounded px-3 py-1.5 text-xs text-[#4a3d32] transition hover:text-[#8a7060]">Clear</button>
                  )}
                  <button onClick={() => void handleSubmit()} disabled={!canSubmit}
                    className="flex items-center gap-2 rounded-lg bg-[#c96442] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#b5593b] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {status === 'loading' ? <Spinner /> : null}
                    {status === 'loading' ? 'Classifying…' : 'Classify'}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[#2e2820] bg-[#211e19] p-4">
              <SampleComplaints onSelect={handleSampleSelect} />
            </div>

            <div className="rounded-lg border border-[#2e2820] bg-[#211e19] p-4">
              <div className="mb-3">
                <p className="section-label mb-1">Batch processing</p>
                <h2 className="text-base font-semibold text-[#e8ddd0]">Upload complaints file</h2>
                <p className="mt-1 text-xs text-[#4a3d32]">.txt with one complaint per line, or .csv with a text column. First {MAX_BATCH_COUNT} valid rows processed.</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".txt,.csv"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleBatchUpload(f) }}
                className="block w-full cursor-pointer rounded-lg border border-[#2e2820] bg-[#191612] px-3 py-2 text-xs text-[#8a7060] file:mr-3 file:rounded file:border-0 file:bg-[#c96442] file:px-3 file:py-1 file:text-xs file:font-medium file:text-white hover:file:bg-[#b5593b]"
              />
              {batchStatus === 'loading' && <p className="mt-2 text-xs text-[#6b5c4e]">Running batch classification…</p>}
              {batchStatus === 'error'   && <p className="mt-2 text-xs text-rose-400">{batchError}</p>}
              {batchResults && (
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <MiniStat label="Processed"  value={batchResults.summary.total} />
                  <MiniStat label="Avg conf"   value={`${(batchResults.summary.average_confidence * 100).toFixed(1)}%`} />
                  <MiniStat label="Model used" value={batchResults.selected_model.split('_').join(' ')} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {status === 'idle' && !result && <EmptyState />}
            {status === 'loading' && <LoadingState />}
            {status === 'error' && (
              <div role="alert" className="rounded-lg border border-rose-900/50 bg-rose-950/30 p-4">
                <p className="mb-1 text-sm font-medium text-rose-400">Classification failed</p>
                <p className="text-xs text-rose-600">{errorMsg}</p>
              </div>
            )}
            {result && <ResultCard result={result} />}
          </div>
        </div>

        <div className="mt-5">
          <ModelMetricsPanel
            metrics={metrics}
            health={health ? { ...health, uptime_seconds: uptime ?? health.uptime_seconds } : null}
            selectedModel={selectedModel === 'best' ? metrics?.best_model ?? health?.best_model ?? 'best' : selectedModel}
            onSelectModel={(model) => setSelectedModel(model)}
          />
        </div>

        {batchResults && (
          <div className="mt-5">
            <BatchResultsTable results={batchResults.results} />
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-[#3d342c]">
          Complaint Intelligence Platform · scikit-learn · TF-IDF · Hosted on HF Spaces
        </footer>
      </div>
    </div>
  )
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const current = text[index]
    const next = text[index + 1]

    if (inQuotes) {
      if (current === '"' && next === '"') {
        cell += '"'
        index += 1
      } else if (current === '"') {
        inQuotes = false
      } else {
        cell += current
      }
      continue
    }

    if (current === '"') {
      inQuotes = true
    } else if (current === ',') {
      row.push(cell)
      cell = ''
    } else if (current === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (current !== '\r') {
      cell += current
    }
  }

  row.push(cell)
  rows.push(row)
  return rows.filter((line) => line.some((value) => value.trim()))
}

function extractComplaints(raw: string): string[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  if (trimmed.includes(',')) {
    const rows = parseCsv(trimmed)
    if (rows.length > 1) {
      const header = rows[0].map((value) => value.trim().toLowerCase())
      const textIndex = header.findIndex((value) =>
        ['text', 'complaint', 'narrative', 'consumer complaint narrative'].includes(value),
      )

      if (textIndex >= 0) {
        return rows
          .slice(1)
          .map((row) => row[textIndex]?.trim())
          .filter((value): value is string => Boolean(value) && value.length >= MIN_CHARS)
      }

      const looksLikeCsvHeader = header.some((value) =>
        ['text', 'complaint', 'narrative', 'product', 'category', 'issue'].includes(value),
      )

      if (looksLikeCsvHeader) {
        return rows
          .slice(1)
          .map((row) => row[0]?.trim())
          .filter((value): value is string => Boolean(value) && value.length >= MIN_CHARS)
      }
    }
  }

  return trimmed
    .split(/\r?\n{1,}/)
    .map((line) => line.trim())
    .filter((line) => line.length >= MIN_CHARS)
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#2e2820] bg-[#211e19] px-4 py-3">
      <p className="section-label">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-[#c8b9a8]">{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[#2e2820] bg-[#1e1b16] px-6 py-16 text-center">
      <div className="mb-3 text-3xl">🔍</div>
      <p className="text-sm font-medium text-[#6b5c4e]">Results will appear here</p>
      <p className="mt-1 text-xs text-[#3d342c]">Enter a complaint and click Classify</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-[#2e2820] bg-[#1e1b16] px-6 py-16 text-center">
      <div className="mb-4 relative h-12 w-12">
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#c96442]" />
        <div className="absolute inset-2 flex items-center justify-center text-lg">🤖</div>
      </div>
      <p className="text-sm font-medium text-[#8a7060]">Classifying complaint…</p>
      <p className="mt-1 text-xs text-[#4a3d32]">Running multi-model comparison pipeline</p>
    </div>
  )
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

function formatUptime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m}m`
}
