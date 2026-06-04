import NavBar from '../components/NavBar'

// ── Static training configuration (mirrors train_platform.py exactly) ─────────

const TRAINING_CONFIG = {
  dataset:       'CFPB Consumer Complaint Database',
  source:        'rows.csv (local export)',
  rawRows:       'varies (filtered to narratives with text)',
  maxPerClass:   4000,
  trainSplit:    '80%',
  testSplit:     '20%',
  randomState:   42,
  vectorizer: {
    type:        'TF-IDF (Term Frequency – Inverse Document Frequency)',
    maxFeatures: '30,000',
    ngramRange:  '(1, 2)  — unigrams + bigrams',
    sublinearTf: 'Yes — dampens high-frequency terms',
    minDf:       3,
    maxDf:       '0.95 (ignore near-universal terms)',
  },
  preprocessing: [
    'Lowercase all text',
    'Replace redacted values (XX…) with token  redacted',
    'Strip URLs and email addresses',
    'Normalise dollar amounts  →  money_amount',
    'Normalise long numeric IDs  →  long_number',
    'Remove non-alphanumeric symbols (keep . , ! ? -)',
    'Collapse multiple whitespace',
  ],
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
}

const MODELS = [
  {
    key:        'linear_svm',
    name:       'Linear SVM',
    emoji:      '⚡',
    tagline:    'Best overall · Production default',
    accent:     { border: 'border-indigo-500/40', bg: 'bg-indigo-500/8', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
    isBest:     true,
    scores:     { accuracy: 81.98, precision: 82.06, recall: 81.98, f1: 81.99 },
    params: [
      { label: 'Algorithm',      value: 'LinearSVC wrapped with CalibratedClassifierCV' },
      { label: 'Regularisation', value: 'C = 1.0' },
      { label: 'Max iterations', value: '5,000' },
      { label: 'Class weights',  value: 'balanced (handles skew)' },
      { label: 'Calibration',    value: 'Sigmoid · 3-fold CV (enables predict_proba)' },
      { label: 'Random state',   value: '42' },
    ],
    strengths: [
      'Highest F1 on this dataset',
      'Linear decision boundary — fast at inference',
      'Class-weight balancing handles category skew well',
      'Calibrated probabilities enable confidence scores',
    ],
    weaknesses: [
      'Calibration adds training overhead (3-fold CV)',
      'No non-linear interactions captured',
      'Confidence scores are sigmoid approximations, not true probabilities',
    ],
    why: 'LinearSVC finds the maximum-margin hyperplane in TF-IDF feature space. Because LinearSVC natively has no predict_proba, it is wrapped with CalibratedClassifierCV using a sigmoid (Platt scaling) method, giving reliable probability estimates. Class-weight balancing ensures minority categories are not drowned out by larger ones like Credit reporting.',
  },
  {
    key:        'logistic_regression',
    name:       'Logistic Regression',
    emoji:      '📈',
    tagline:    'Strong linear baseline · Close runner-up',
    accent:     { border: 'border-blue-500/30', bg: 'bg-blue-500/5', badge: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
    isBest:     false,
    scores:     { accuracy: 81.89, precision: 82.06, recall: 81.89, f1: 81.94 },
    params: [
      { label: 'Solver',         value: 'SAGA (handles L1/L2, large datasets)' },
      { label: 'Max iterations', value: '2,500' },
      { label: 'Regularisation', value: 'C = 1.0  (L2 by default with SAGA)' },
      { label: 'Class weights',  value: 'balanced' },
      { label: 'Parallelism',    value: 'n_jobs = -1  (all CPU cores)' },
      { label: 'Random state',   value: '42' },
    ],
    strengths: [
      'Native probability output — no calibration wrapper needed',
      'SAGA solver scales well to 30k+ features',
      'Well-understood statistical model',
      'Comparable accuracy to Linear SVM on this task',
    ],
    weaknesses: [
      'Convergence can be slow with very high-dimensional features',
      'Slightly lower F1 than Linear SVM on this dataset',
    ],
    why: 'Logistic Regression optimises a cross-entropy loss directly, naturally producing well-calibrated probabilities. SAGA (a variant of SVRG) handles the large sparse TF-IDF matrix efficiently. Because it is a probabilistic model by design, it avoids the post-hoc calibration step required by SVM, at the cost of a slightly slower training loop.',
  },
  {
    key:        'multinomial_nb',
    name:       'Multinomial Naive Bayes',
    emoji:      '🎲',
    tagline:    'Fast probabilistic baseline',
    accent:     { border: 'border-violet-500/30', bg: 'bg-violet-500/5', badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
    isBest:     false,
    scores:     { accuracy: 79.22, precision: 79.34, recall: 79.21, f1: 79.20 },
    params: [
      { label: 'Algorithm',      value: 'Multinomial Naive Bayes' },
      { label: 'Smoothing (α)',  value: '0.2  (mild Laplace smoothing)' },
      { label: 'Input',          value: 'TF-IDF matrix (non-negative, sparse)' },
      { label: 'Assumption',     value: 'Feature independence per class' },
    ],
    strengths: [
      'Fastest training of all four models',
      'No hyperparameter tuning required',
      'Works natively with sparse count-like features',
      'Strong on well-separated categories (Mortgage, Student loan)',
    ],
    weaknesses: [
      'Independence assumption rarely holds in real text',
      'Lowest accuracy of all four models',
      'Struggles most with Loans / Debt collection overlap',
    ],
    why: 'Multinomial NB applies Bayes\' theorem assuming each TF-IDF feature is conditionally independent given the class. Despite this strong assumption being violated in practice, it achieves solid baseline accuracy because the TF-IDF weighting already removes a lot of noise. Alpha = 0.2 (lighter than the default 1.0) was chosen to avoid over-smoothing in the presence of 30k features.',
  },
  {
    key:        'random_forest',
    name:       'Random Forest',
    emoji:      '🌲',
    tagline:    'Non-linear ensemble · SVD-reduced input',
    accent:     { border: 'border-green-500/30', bg: 'bg-green-500/5', badge: 'bg-green-500/15 text-green-300 border-green-500/30' },
    isBest:     false,
    scores:     { accuracy: 76.01, precision: 76.28, recall: 76.01, f1: 75.99 },
    params: [
      { label: 'Pipeline step 1', value: 'TruncatedSVD → 150 components (LSA)' },
      { label: 'Estimators',      value: '120 trees' },
      { label: 'Max depth',       value: '28' },
      { label: 'Min samples leaf', value: '2' },
      { label: 'Class weights',   value: 'balanced_subsample (per tree)' },
      { label: 'Parallelism',     value: 'n_jobs = -1' },
      { label: 'Random state',    value: '42' },
    ],
    strengths: [
      'Captures non-linear feature interactions',
      'Feature importance scores available',
      'Robust to noisy features',
      'Ensemble reduces variance compared to a single tree',
    ],
    weaknesses: [
      'Lowest accuracy — non-linear interactions don\'t help much in TF-IDF space',
      'Requires dimensionality reduction (SVD) to be tractable on 30k features',
      'SVD → RF pipeline discards some information',
      'Slowest model to train and to run inference',
    ],
    why: 'Random Forests can\'t operate directly on a 30k-dimensional sparse TF-IDF matrix at reasonable speed. TruncatedSVD (Latent Semantic Analysis) first compresses the matrix to 150 dense components, capturing the major variance directions. The forest then learns non-linear splits on those components. This architecture is included as a comparison point — it shows that non-linearity doesn\'t help much for bag-of-words text features, where linear models dominate.',
  },
]

const METRIC_META = [
  { key: 'accuracy',  label: 'Accuracy',  desc: 'Fraction of all predictions that are correct.',                          colour: 'text-indigo-300' },
  { key: 'precision', label: 'Precision', desc: 'Of all predictions for a class, how many are actually that class.',      colour: 'text-blue-300'   },
  { key: 'recall',    label: 'Recall',    desc: 'Of all true instances of a class, how many did the model find.',         colour: 'text-violet-300' },
  { key: 'f1',        label: 'F1',        desc: 'Harmonic mean of precision and recall — the primary ranking metric.',    colour: 'text-emerald-300'},
]

// ── Component ──────────────────────────────────────────────────────────────────

export default function ModelsPage() {
  return (
    <div className="relative min-h-screen bg-[#080c14]">
      <NavBar />

      {/* Ambient blobs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-600/8 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[350px] w-[350px] rounded-full bg-green-600/6 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <header className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/8 px-4 py-1.5 text-xs font-semibold tracking-wide text-indigo-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" aria-hidden="true" />
            Model Explorer
          </div>
          <h1 className="bg-gradient-to-br from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
            The Four Models
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-400">
            Every prediction you make runs all four models in parallel. Here's how each one
            was built, what tradeoffs it makes, and where it excels.
          </p>
        </header>

        {/* ── Training config strip ── */}
        <section className="mb-12" aria-labelledby="training-config-heading">
          <h2 id="training-config-heading" className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Shared training configuration
          </h2>
          <div className="gradient-border rounded-2xl bg-surface-raised p-6 shadow-xl">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ConfigGroup title="Dataset">
                <ConfigRow label="Source"      value={TRAINING_CONFIG.dataset} />
                <ConfigRow label="File"        value={TRAINING_CONFIG.source} />
                <ConfigRow label="Max / class" value={`${TRAINING_CONFIG.maxPerClass.toLocaleString()} rows`} />
                <ConfigRow label="Train split" value={TRAINING_CONFIG.trainSplit} />
                <ConfigRow label="Test split"  value={TRAINING_CONFIG.testSplit} />
                <ConfigRow label="Random seed" value={String(TRAINING_CONFIG.randomState)} />
              </ConfigGroup>

              <ConfigGroup title="TF-IDF Vectorizer">
                <ConfigRow label="Max features" value={TRAINING_CONFIG.vectorizer.maxFeatures} />
                <ConfigRow label="N-gram range" value={TRAINING_CONFIG.vectorizer.ngramRange} />
                <ConfigRow label="Sublinear TF" value={TRAINING_CONFIG.vectorizer.sublinearTf} />
                <ConfigRow label="Min DF"        value={String(TRAINING_CONFIG.vectorizer.minDf)} />
                <ConfigRow label="Max DF"        value={TRAINING_CONFIG.vectorizer.maxDf} />
              </ConfigGroup>

              <ConfigGroup title="Preprocessing steps">
                <ol className="list-none space-y-1.5">
                  {TRAINING_CONFIG.preprocessing.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className="mt-0.5 shrink-0 rounded bg-slate-800 px-1.5 py-0.5 font-mono text-[10px] text-slate-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </ConfigGroup>
            </div>

            <div className="mt-6 border-t border-slate-800 pt-5">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                Target categories ({TRAINING_CONFIG.categories.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {TRAINING_CONFIG.categories.map((cat) => (
                  <span
                    key={cat}
                    className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Score comparison table ── */}
        <section className="mb-12" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="mb-4 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Performance comparison (test set · macro average)
          </h2>
          <div className="gradient-border overflow-auto rounded-2xl bg-surface-raised shadow-xl">
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/60">
                  <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400">Model</th>
                  {METRIC_META.map((m) => (
                    <th key={m.key} className="px-4 py-3 text-right text-xs font-semibold text-slate-400">
                      <span className={m.colour}>{m.label}</span>
                      <p className="mt-0.5 text-[10px] font-normal text-slate-600 max-w-[120px] text-right">{m.desc}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MODELS.map((model) => (
                  <tr key={model.key} className={`border-b border-slate-800/60 transition hover:bg-slate-800/30 ${model.isBest ? 'bg-indigo-500/5' : ''}`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl" aria-hidden="true">{model.emoji}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200">{model.name}</span>
                            {model.isBest && (
                              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                                Best
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">{model.tagline}</span>
                        </div>
                      </div>
                    </td>
                    {METRIC_META.map((m) => {
                      const val = model.scores[m.key as keyof typeof model.scores]
                      const isBestScore = MODELS.every(
                        (other) => other.scores[m.key as keyof typeof model.scores] <= val
                      )
                      return (
                        <td key={m.key} className="px-4 py-3.5 text-right">
                          <span className={`tabular-nums font-semibold ${isBestScore ? m.colour : 'text-slate-300'}`}>
                            {val.toFixed(2)}%
                          </span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Individual model deep-dives ── */}
        <section aria-labelledby="model-cards-heading">
          <h2 id="model-cards-heading" className="mb-6 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Model deep-dives
          </h2>
          <div className="space-y-6">
            {MODELS.map((model, idx) => (
              <ModelCard key={model.key} model={model} index={idx} />
            ))}
          </div>
        </section>

        <footer className="mt-16 text-center text-xs text-slate-700">
          All models trained on CFPB data · scikit-learn · TF-IDF · random_state = 42
        </footer>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ModelCard({ model, index }: { model: typeof MODELS[number]; index: number }) {
  return (
    <article
      className={`gradient-border rounded-2xl bg-surface-raised p-6 shadow-xl ${model.accent.bg} animate-fade-up`}
      style={{ animationDelay: `${index * 60}ms` }}
      aria-labelledby={`model-${model.key}-heading`}
    >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border text-3xl ${model.accent.bg} ${model.accent.border}`}>
            {model.emoji}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 id={`model-${model.key}-heading`} className="text-xl font-bold text-white">
                {model.name}
              </h3>
              {model.isBest && (
                <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${model.accent.badge}`}>
                  Best model
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-slate-400">{model.tagline}</p>
          </div>
        </div>

        {/* Score pills */}
        <div className="flex flex-wrap gap-2">
          {METRIC_META.map((m) => (
            <div key={m.key} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wide text-slate-600">{m.label}</p>
              <p className={`text-base font-bold ${m.colour}`}>
                {model.scores[m.key as keyof typeof model.scores].toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr_1.2fr]">
        {/* Hyperparameters */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            Hyperparameters
          </p>
          <div className="space-y-2">
            {model.params.map((p) => (
              <div key={p.label} className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wide text-slate-600">{p.label}</p>
                <p className="mt-0.5 font-mono text-xs text-slate-300">{p.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths + Weaknesses */}
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Strengths
            </p>
            <ul className="space-y-1.5">
              {model.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="mt-0.5 shrink-0 text-emerald-400" aria-hidden="true">✓</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
              Weaknesses
            </p>
            <ul className="space-y-1.5">
              {model.weaknesses.map((w) => (
                <li key={w} className="flex items-start gap-2 text-xs text-slate-400">
                  <span className="mt-0.5 shrink-0 text-rose-400" aria-hidden="true">✗</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Why this model */}
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
            How it works
          </p>
          <p className="text-sm leading-relaxed text-slate-400">{model.why}</p>

          {/* Mini accuracy bar */}
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-slate-500">
              <span>F1 score</span>
              <span className="font-semibold text-slate-300">{model.scores.f1.toFixed(2)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-700"
                style={{ width: `${model.scores.f1}%` }}
                role="progressbar"
                aria-valuenow={model.scores.f1}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
            <div className="mt-3 flex justify-between text-[10px] text-slate-700">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function ConfigGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2">
      <span className="text-[11px] uppercase tracking-wide text-slate-600">{label}</span>
      <span className="text-right font-mono text-xs text-slate-300">{value}</span>
    </div>
  )
}
