import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/',       label: 'Classifier' },
  { to: '/models', label: 'Models'     },
]

export default function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-[#2e2820] bg-[#1a1814]/95 backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#e8ddd0]">Complaint Intelligence</span>
          <span className="rounded border border-[#3d342c] px-1.5 py-0.5 text-[10px] font-medium text-[#6b5c4e]">
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
                    ? 'bg-[#2e2820] text-[#e8ddd0] font-medium'
                    : 'text-[#8a7060] hover:bg-[#252119] hover:text-[#c8b9a8]'
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
