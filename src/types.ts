export interface CategoryProbability {
  category: string
  probability: number
}

export interface ModelPrediction {
  model_name: string
  category: string
  confidence: number
}

export interface PredictResponse {
  selected_model: string
  category: string
  confidence: number
  all_probabilities: CategoryProbability[]
  clean_text_preview: string
  comparisons: ModelPrediction[]
}

export interface BatchItem {
  index: number
  original_text: string
  clean_text_preview: string
  selected_model: string
  category: string
  confidence: number
  comparisons: ModelPrediction[]
}

export interface BatchSummary {
  total: number
  average_confidence: number
  category_counts: Record<string, number>
}

export interface BatchPredictResponse {
  selected_model: string
  summary: BatchSummary
  results: BatchItem[]
}

export interface MetricRow {
  accuracy: number
  precision: number
  recall: number
  f1: number
  support: number
  confusion_matrix: number[][]
  report: Record<string, unknown>
}

export interface MetricsResponse {
  best_model: string
  categories: string[]
  models: Record<string, MetricRow>
}

export interface HealthResponse {
  status: string
  model_version: string
  trained_at: string | null
  best_model: string
  available_models: string[]
  request_count: number
  prediction_count: number
  batch_count: number
  uptime_seconds: number
}

export interface MonitoringEvent {
  type: 'prediction' | 'batch'
  timestamp: string
  [key: string]: unknown
}

export interface MonitoringResponse {
  request_count: number
  prediction_count: number
  batch_count: number
  recent_events: MonitoringEvent[]
}

export interface ApiError {
  detail: string | { msg: string }[]
}
