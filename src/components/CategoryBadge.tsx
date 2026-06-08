export const CATEGORY_META: Record<string, {
  bg: string; text: string; border: string; icon: string; glow: string
}> = {
  'Credit reporting':      { bg: 'bg-violet-50',  text: 'text-violet-700',  border: 'border-violet-200', icon: '📋', glow: '' },
  'Credit card / prepaid': { bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',   icon: '💳', glow: '' },
  'Bank account':          { bg: 'bg-cyan-50',    text: 'text-cyan-700',    border: 'border-cyan-200',   icon: '🏦', glow: '' },
  'Mortgage':              { bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',  icon: '🏠', glow: '' },
  'Debt collection':       { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',   icon: '📞', glow: '' },
  'Student loan':          { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200',icon: '🎓', glow: '' },
  'Loans':                 { bg: 'bg-orange-50',  text: 'text-orange-700',  border: 'border-orange-200', icon: '🚗', glow: '' },
  'Money services':        { bg: 'bg-teal-50',    text: 'text-teal-700',    border: 'border-teal-200',   icon: '💸', glow: '' },
  'Other':                 { bg: 'bg-stone-50',   text: 'text-stone-600',   border: 'border-stone-200',  icon: '📁', glow: '' },
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
