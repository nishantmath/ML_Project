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
    <div className="relative min-h-screen overflow-x-hidden bg-[#080c14]">
      <NavBar />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-600/8 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" aria-hidden="true" />
            Complaint Intelligence Platform
          </div>
          <h1 className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            Complaint Classifier
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-400">
            Multi-model CFPB complaint analysis with evaluation metrics, batch upload, and
            deployment monitoring.
          </p>
        </header>

        <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MiniStat
            label="Best model"
            value={health?.best_model ?? metrics?.best_model ?? 'Loading'}
            accent="text-indigo-300"
          />
          <MiniStat label="Version" value={health?.model_version ?? 'Loading'} accent="text-cyan-300" />
          <MiniStat label="Uptime" value={uptime !== null ? formatUptime(uptime) : 'Loading'} accent="text-emerald-300" />
          <MiniStat label="Active models" value={health?.available_models.length ?? 0} accent="text-amber-300" />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="flex flex-col gap-5">
            <div className="gradient-border rounded-2xl bg-surface-raised p-6 shadow-xl">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                    Single complaint analysis
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-white">Predict and compare models</h2>
                </div>
                <label className="text-xs text-slate-500">
                  Model
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableModels.map((model) => (
                      <button
                        key={model}
                        type="button"
                        onClick={() => setSelectedModel(model)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          selectedModel === model
                            ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-200'
                            : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                        }`}
                      >
                        {model === 'best' ? 'Best model' : model.split('_').join(' ')}
                      </button>
                    ))}
                  </div>
                </label>
              </div>

              <textarea
                id="complaint-input"
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value.slice(0, MAX_CHARS))
                  if (status === 'error') setStatus('idle')
                }}
                onKeyDown={handleKeyDown}
                rows={9}
                placeholder="Describe the consumer complaint in detail..."
                className="w-full resize-none rounded-xl border border-slate-700/60 bg-slate-900/80 px-4 py-3.5 text-sm leading-relaxed text-slate-100 placeholder-slate-600 transition-colors focus:border-indigo-500/60 focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
                aria-describedby="char-count"
              />

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <span
                  id="char-count"
                  className={`text-xs tabular-nums ${
                    charCount > MAX_CHARS * 0.9 ? 'text-amber-400' : 'text-slate-600'
                  }`}
                >
                  {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                  {charCount > 0 && charCount < MIN_CHARS && (
                    <span className="ml-2 text-rose-400">
                      ({MIN_CHARS - charCount} more needed)
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  {text.length > 0 && (
                    <button
                      onClick={handleClear}
                      className="rounded-lg px-3 py-1.5 text-xs text-slate-500 transition hover:bg-slate-800 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    onClick={() => void handleSubmit()}
                    disabled={!canSubmit}
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500 hover:shadow-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-35 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {status === 'loading' ? <Spinner /> : null}
                    {status === 'loading' ? 'Classifying…' : 'Classify'}
                  </button>
                </div>
              </div>
            </div>

            <div className="gradient-border rounded-2xl bg-surface-raised p-5 shadow-xl">
              <SampleComplaints onSelect={handleSampleSelect} />
            </div>

            <div className="gradient-border rounded-2xl bg-surface-raised p-5 shadow-xl">
              <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                  Batch processing
                </p>
                <h2 className="mt-1 text-lg font-semibold text-white">Upload complaints file</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Upload a `.txt` file with one complaint per line or a CSV with a `text` column.
                  The first {MAX_BATCH_COUNT} valid complaints are processed.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    void handleBatchUpload(file)
                  }
                }}
                className="block w-full cursor-pointer rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-indigo-500"
              />
              <p className="mt-3 text-xs text-slate-600">
                Accepted: one complaint per line or CSV with a `text`, `complaint`, or
                `narrative` column.
              </p>
              {batchStatus === 'loading' && (
                <p className="mt-3 text-sm text-indigo-300">Running batch classification…</p>
              )}
              {batchStatus === 'error' && (
                <p className="mt-3 text-sm text-rose-300">{batchError}</p>
              )}
              {batchResults && (
                <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                  <MiniStat label="Rows processed" value={batchResults.summary.total} />
                  <MiniStat label="Avg confidence" value={`${(batchResults.summary.average_confidence * 100).toFixed(1)}%`} />
                  <MiniStat label="Selected model" value={batchResults.selected_model.split('_').join(' ')} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-5">
            {status === 'idle' && !result && (
              <EmptyState />
            )}

            {status === 'loading' && (
              <LoadingState />
            )}

            {status === 'error' && (
              <div
                role="alert"
                className="animate-fade-up rounded-2xl border border-rose-500/25 bg-rose-500/8 p-6"
              >
                <div className="mb-2 flex items-center gap-2 text-rose-400">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                  <span className="text-sm font-semibold">Classification failed</span>
                </div>
                <p className="text-sm text-rose-300/80">{errorMsg}</p>
              </div>
            )}

            {result && <ResultCard result={result} />}
          </div>
        </div>

        <div className="mt-6">
          <ModelMetricsPanel
            metrics={metrics}
            health={health ? { ...health, uptime_seconds: uptime ?? health.uptime_seconds } : null}
            selectedModel={selectedModel === 'best' ? metrics?.best_model ?? health?.best_model ?? 'best' : selectedModel}
            onSelectModel={(model) => setSelectedModel(model)}
          />
        </div>

        {batchResults && (
          <div className="mt-6">
            <BatchResultsTable results={batchResults.results} />
          </div>
        )}

        <footer className="mt-16 text-center text-xs text-slate-700">
          Complaint Intelligence Platform · Multi-model comparison · Batch processing · Monitoring
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

function MiniStat({
  label,
  value,
  accent = 'text-slate-200',
}: {
  label: string
  value: string | number
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 shadow-xl">
      <p className="text-[10px] uppercase tracking-widest text-slate-600">{label}</p>
      <p className={`mt-1 text-base font-semibold ${accent}`}>{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700 bg-slate-800 text-2xl">
        🔍
      </div>
      <p className="text-sm font-medium text-slate-400">Results will appear here</p>
      <p className="mt-1 text-xs text-slate-600">Enter a complaint and click Classify</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-indigo-500/15 bg-indigo-500/5 px-6 py-16 text-center">
      <div className="mb-5 relative h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-indigo-500" />
        <div className="absolute inset-2 flex items-center justify-center text-xl">🤖</div>
      </div>
      <p className="text-sm font-medium text-indigo-300">Classifying complaint…</p>
      <p className="mt-1 text-xs text-slate-600">Running multi-model comparison pipeline</p>
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
