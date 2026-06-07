export const CATEGORY_META: Record<string, {
  bg: string; text: string; border: string; icon: string; glow: string
}> = {
  'Credit reporting':      { bg: 'bg-slate-800/60', text: 'text-violet-300',  border: 'border-slate-700', icon: '📋', glow: '' },
  'Credit card / prepaid': { bg: 'bg-slate-800/60', text: 'text-blue-300',    border: 'border-slate-700', icon: '💳', glow: '' },
  'Bank account':          { bg: 'bg-slate-800/60', text: 'text-cyan-300',    border: 'border-slate-700', icon: '🏦', glow: '' },
  'Mortgage':              { bg: 'bg-slate-800/60', text: 'text-amber-300',   border: 'border-slate-700', icon: '🏠', glow: '' },
  'Debt collection':       { bg: 'bg-slate-800/60', text: 'text-rose-300',    border: 'border-slate-700', icon: '📞', glow: '' },
  'Student loan':          { bg: 'bg-slate-800/60', text: 'text-emerald-300', border: 'border-slate-700', icon: '🎓', glow: '' },
  'Loans':                 { bg: 'bg-slate-800/60', text: 'text-orange-300',  border: 'border-slate-700', icon: '🚗', glow: '' },
  'Money services':        { bg: 'bg-slate-800/60', text: 'text-teal-300',    border: 'border-slate-700', icon: '💸', glow: '' },
  'Other':                 { bg: 'bg-slate-800/60', text: 'text-slate-400',   border: 'border-slate-700', icon: '📁', glow: '' },
}

const fallback = CATEGORY_META['Other']

interface Props {
  category: string
  size?: 'sm' | 'md' | 'lg'
}

export default function CategoryBadge({ category, size = 'sm' }: Props) {
  const c = CATEGORY_META[category] ?? fallback

  const sizeClass =
    size === 'lg' ? 'px-3 py-1.5 text-sm gap-2' :
    size === 'md' ? 'px-2.5 py-1 text-xs gap-1.5' :
                    'px-2 py-0.5 text-xs gap-1.5'

  return (
    <span className={`inline-flex items-center rounded-md border font-medium ${c.bg} ${c.text} ${c.border} ${sizeClass}`}>
      <span aria-hidden="true">{c.icon}</span>
      {category}
    </span>
  )
}
