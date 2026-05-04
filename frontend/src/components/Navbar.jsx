import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/ai-coach', label: 'AI Coach' },
]

const Navbar = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-lg">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-6">
          <span className="text-lg font-semibold text-slate-100">AI Finance Coach</span>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-3 py-1 transition ${
                    isActive
                      ? 'bg-emerald-400/20 text-emerald-200'
                      : 'text-slate-300 hover:text-emerald-200'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-lg border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400 hover:text-slate-950"
        >
          Log out
        </button>
      </div>
    </nav>
  )
}

export default Navbar
