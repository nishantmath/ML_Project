import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/',       label: 'Classifier' },
  { to: '/models', label: 'Models'     },
]

export default function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-slate-800/70 bg-[#0f1117]/95 backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-200">Complaint Intelligence</span>
          <span className="rounded border border-slate-700 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
            CFPB
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm transition ${
                  isActive
                    ? 'bg-slate-800 text-slate-200 font-medium'
                    : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
