import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/',       label: 'Classifier' },
  { to: '/models', label: 'Models'     },
]

export default function NavBar() {
  return (
    <nav
      className="sticky top-0 z-50 border-b border-[#e0d4c8] bg-[#f5f0ea]/95 backdrop-blur-sm"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#2c1f14]">Complaint Intelligence</span>
          <span className="rounded border border-[#d4c4b4] px-1.5 py-0.5 text-[10px] font-medium text-[#9e8a78]">
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
                    ? 'bg-[#e8ddd0] text-[#2c1f14] font-medium'
                    : 'text-[#9e8a78] hover:bg-[#ede7e0] hover:text-[#4a3728]'
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
