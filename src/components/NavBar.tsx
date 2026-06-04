import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/',       label: 'Classifier',  icon: '🔍' },
  { to: '/models', label: 'Models',      icon: '🧠' },
]

export default function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#080c14]/90 backdrop-blur-md"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-sm">
            📋
          </div>
          <span className="text-sm font-semibold text-white">
            Complaint Intelligence
          </span>
          <span className="hidden rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-semibold text-indigo-400 sm:inline">
            CFPB
          </span>
        </div>

        {/* Links */}
        <div className="flex items-center gap-1">
          {LINKS.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) =>
                `flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-500/15 text-indigo-300'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              <span aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
