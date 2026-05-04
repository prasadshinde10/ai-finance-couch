import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Dashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900/70 p-10 shadow-lg">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <p className="mt-3 text-slate-300">
          Welcome back{user?.name ? `, ${user.name}` : ''}! Your coaching insights will
          appear here soon.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 rounded-lg border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-emerald-400 hover:text-slate-950"
        >
          Log out
        </button>
      </div>
    </div>
  )
}

export default Dashboard
