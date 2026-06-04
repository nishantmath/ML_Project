import type {
  ApiError,
  BatchPredictResponse,
  HealthResponse,
  MetricsResponse,
  PredictResponse,
} from './types'
import { FALLBACK_HEALTH, FALLBACK_METRICS } from './data/fallbackData'

const BASE = 'https://Tobi015-ml-project.hf.space'

async function parseError(res: Response): Promise<string> {
  try {
    const err: ApiError = await res.json()
    return Array.isArray(err.detail)
      ? err.detail.map((item) => item.msg).join(', ')
      : String(err.detail)
  } catch {
    return `Request failed with status ${res.status}`
  }
}

async function loadStaticMetrics(): Promise<MetricsResponse> {
  try {
    const res = await fetch('/metrics.json')
    if (!res.ok) {
      return FALLBACK_METRICS
    }

    const models = (await res.json()) as MetricsResponse['models']
    const entries = Object.entries(models)
    const bestModel =
      entries.length > 0
        ? entries.reduce((best, current) => (current[1].f1 > best[1].f1 ? current : best))[0]
        : FALLBACK_METRICS.best_model

    return {
      best_model: bestModel,
      categories: FALLBACK_METRICS.categories,
      models,
    }
  } catch {
    return FALLBACK_METRICS
  }
}

export async function classify(text: string, model?: string): Promise<PredictResponse> {
  const res = await fetch(`${BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model }),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json() as Promise<PredictResponse>
}

export async function classifyBatch(texts: string[], model?: string): Promise<BatchPredictResponse> {
  const res = await fetch(`${BASE}/batch-predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts, model }),
  })

  if (!res.ok) {
    throw new Error(await parseError(res))
  }

  return res.json() as Promise<BatchPredictResponse>
}

export async function getMetrics(): Promise<MetricsResponse> {
  try {
    const res = await fetch(`${BASE}/metrics`)
    if (!res.ok) {
      throw new Error(await parseError(res))
    }
    return res.json() as Promise<MetricsResponse>
  } catch {
    return loadStaticMetrics()
  }
}

export async function getHealth(): Promise<HealthResponse> {
  try {
    const res = await fetch(`${BASE}/health`)
    if (!res.ok) {
      throw new Error(await parseError(res))
    }
    return res.json() as Promise<HealthResponse>
  } catch {
    return FALLBACK_HEALTH
  }
}
