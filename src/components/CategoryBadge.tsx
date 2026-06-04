export const CATEGORY_META: Record<string, {
  bg: string; text: string; border: string; icon: string; glow: string
}> = {
  'Credit reporting':      { bg: 'bg-violet-500/10', text: 'text-violet-300', border: 'border-violet-500/30', icon: '📋', glow: 'shadow-violet-500/20' },
  'Credit card / prepaid': { bg: 'bg-blue-500/10',   text: 'text-blue-300',   border: 'border-blue-500/30',   icon: '💳', glow: 'shadow-blue-500/20'   },
  'Bank account':          { bg: 'bg-cyan-500/10',    text: 'text-cyan-300',   border: 'border-cyan-500/30',   icon: '🏦', glow: 'shadow-cyan-500/20'   },
  'Mortgage':              { bg: 'bg-amber-500/10',   text: 'text-amber-300',  border: 'border-amber-500/30',  icon: '🏠', glow: 'shadow-amber-500/20'  },
  'Debt collection':       { bg: 'bg-rose-500/10',    text: 'text-rose-300',   border: 'border-rose-500/30',   icon: '📞', glow: 'shadow-rose-500/20'   },
  'Student loan':          { bg: 'bg-green-500/10',   text: 'text-green-300',  border: 'border-green-500/30',  icon: '🎓', glow: 'shadow-green-500/20'  },
  'Loans':                 { bg: 'bg-orange-500/10',  text: 'text-orange-300', border: 'border-orange-500/30', icon: '🚗', glow: 'shadow-orange-500/20' },
  'Money services':        { bg: 'bg-teal-500/10',    text: 'text-teal-300',   border: 'border-teal-500/30',   icon: '💸', glow: 'shadow-teal-500/20'   },
  'Other':                 { bg: 'bg-slate-500/10',   text: 'text-slate-300',  border: 'border-slate-500/30',  icon: '📁', glow: 'shadow-slate-500/20'  },
}

const fallback = CATEGORY_META['Other']

interface Props {
  category: string
  size?: 'sm' | 'md' | 'lg'
}

export default function CategoryBadge({ category, size = 'sm' }: Props) {
  const c = CATEGORY_META[category] ?? fallback

  const sizeClass =
    size === 'lg' ? 'px-4 py-2 text-sm gap-2' :
    size === 'md' ? 'px-3 py-1.5 text-xs gap-1.5' :
                    'px-2.5 py-1 text-xs gap-1.5'

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${c.bg} ${c.text} ${c.border} ${sizeClass}`}>
      <span aria-hidden="true">{c.icon}</span>
      {category}
    </span>
  )
}
