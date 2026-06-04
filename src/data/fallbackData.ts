import type { HealthResponse, MetricsResponse } from '../types'

export const FALLBACK_HEALTH: HealthResponse = {
  status: 'offline',
  model_version: 'complaint-platform-static',
  trained_at: null,
  best_model: 'linear_svm',
  available_models: ['linear_svm', 'logistic_regression', 'multinomial_nb', 'random_forest'],
  request_count: 0,
  prediction_count: 0,
  batch_count: 0,
  uptime_seconds: 0,
}

export const FALLBACK_METRICS: MetricsResponse = {
  best_model: 'linear_svm',
  categories: [
    'Bank account',
    'Credit card / prepaid',
    'Credit reporting',
    'Debt collection',
    'Loans',
    'Money services',
    'Mortgage',
    'Student loan',
  ],
  models: {
    multinomial_nb: {
      accuracy: 0.7922,
      precision: 0.7934,
      recall: 0.7921,
      f1: 0.792,
      support: 6399,
      confusion_matrix: [],
      report: {},
    },
    logistic_regression: {
      accuracy: 0.8189,
      precision: 0.8206,
      recall: 0.8189,
      f1: 0.8194,
      support: 6399,
      confusion_matrix: [],
      report: {},
    },
    linear_svm: {
      accuracy: 0.8198,
      precision: 0.8206,
      recall: 0.8198,
      f1: 0.8199,
      support: 6399,
      confusion_matrix: [],
      report: {},
    },
    random_forest: {
      accuracy: 0.7601,
      precision: 0.7628,
      recall: 0.7601,
      f1: 0.7599,
      support: 6399,
      confusion_matrix: [],
      report: {},
    },
  },
}
