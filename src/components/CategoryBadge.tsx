export const CATEGORY_META: Record<string, {
  bg: string; text: string; border: string; icon: string; glow: string
}> = {
  'Credit reporting':      { bg: 'bg-violet-900/40', text: 'text-violet-300',  border: 'border-violet-800/50', icon: '📋', glow: '' },
  'Credit card / prepaid': { bg: 'bg-blue-900/40',   text: 'text-blue-300',    border: 'border-blue-800/50',   icon: '💳', glow: '' },
  'Bank account':          { bg: 'bg-cyan-900/40',    text: 'text-cyan-300',    border: 'border-cyan-800/50',   icon: '🏦', glow: '' },
  'Mortgage':              { bg: 'bg-amber-900/40',   text: 'text-amber-300',   border: 'border-amber-800/50',  icon: '🏠', glow: '' },
  'Debt collection':       { bg: 'bg-rose-900/40',    text: 'text-rose-300',    border: 'border-rose-800/50',   icon: '📞', glow: '' },
  'Student loan':          { bg: 'bg-emerald-900/40', text: 'text-emerald-300', border: 'border-emerald-800/50',icon: '🎓', glow: '' },
  'Loans':                 { bg: 'bg-orange-900/40',  text: 'text-orange-300',  border: 'border-orange-800/50', icon: '🚗', glow: '' },
  'Money services':        { bg: 'bg-teal-900/40',    text: 'text-teal-300',    border: 'border-teal-800/50',   icon: '💸', glow: '' },
  'Other':                 { bg: 'bg-zinc-800/50',    text: 'text-zinc-400',    border: 'border-zinc-700/50',   icon: '📁', glow: '' },
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
