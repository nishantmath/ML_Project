import { NavLink } from 'react-router-dom'

const LINKS = [
  { to: '/',       label: 'Classifier' },
  { to: '/models', label: 'Models'     },
]

export default function NavBar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#2a2d31] bg-[#111214]/95 backdrop-blur-sm" aria-label="Main navigation">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-[#e4e6e9]">Complaint Intelligence</span>
          <span className="rounded border border-[#3a3d42] px-1.5 py-0.5 text-[10px] font-medium text-[#555d66]">CFPB</span>
        </div>
        <div className="flex items-center gap-0.5">
          {LINKS.map(({ to, label }) => (
            <NavLink key={to} to={to} end
              className={({ isActive }) =>
                `rounded-md px-3 py-1.5 text-sm transition ${
                  isActive
                    ? 'bg-[#2a2d31] text-[#e4e6e9] font-medium'
                    : 'text-[#7a8390] hover:bg-[#1c1e21] hover:text-[#c0c4ca]'
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
