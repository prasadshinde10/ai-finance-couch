import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/ai-coach', label: 'AI Coach' },
  { to: '/goals', label: 'Goals' },
  { to: '/profile', label: 'Profile' },
]

const Navbar = () => {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    logout()
    localStorage.clear()
    navigate('/login')
  }

  const linkClasses = ({ isActive }) =>
    `inline-flex items-center border-b-2 px-2 py-1 text-sm font-medium transition ${
      isActive
        ? 'border-blue-600 text-blue-600'
        : 'border-transparent text-gray-600 hover:text-blue-600'
    }`

  return (
    <nav className="rounded-xl bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="text-lg font-semibold text-gray-900">💰 FinCoach</span>
          <div className="hidden items-center gap-4 md:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={linkClasses}>
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div className="hidden items-center gap-4 md:flex">
          <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Logout
          </button>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:text-blue-600 md:hidden"
          aria-label="Toggle navigation"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {isOpen ? (
        <div className="mt-4 flex flex-col gap-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={linkClasses}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Logout
            </button>
          </div>
        </div>
      ) : null}
    </nav>
  )
}

export default Navbar
