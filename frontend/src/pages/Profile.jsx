import { useCallback, useEffect, useMemo, useState } from 'react'
import { getGoals } from '../api/goalApi'
import { getStats, getTransactions } from '../api/transactionApi'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
import { useAuth } from '../context/AuthContext'
import { toast } from 'react-hot-toast'

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const Profile = () => {
  const { user, token } = useAuth()
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [transactionsCount, setTransactionsCount] = useState(0)
  const [goals, setGoals] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const loadProfile = useCallback(async () => {
    if (!token) {
      return
    }

    setIsLoading(true)
    try {
      const [statsData, transactionsData, goalsData] = await Promise.all([
        getStats(token),
        getTransactions(token),
        getGoals(token),
      ])
      setStats(statsData)
      setTransactionsCount(Array.isArray(transactionsData) ? transactionsData.length : 0)
      setGoals(Array.isArray(goalsData) ? goalsData : [])
      setError('')
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load profile'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProfile()
  }, [loadProfile])

  const createdAtLabel = useMemo(() => {
    if (!user?.createdAt) {
      return 'N/A'
    }
    const parsed = new Date(user.createdAt)
    return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString()
  }, [user])

  const completedGoals = useMemo(
    () => goals.filter((goal) => goal.isCompleted).length,
    [goals]
  )

  const summaryStats = [
    { label: 'Total transactions', value: transactionsCount },
    { label: 'Total income', value: formatCurrency(stats.totalIncome) },
    { label: 'Total expense', value: formatCurrency(stats.totalExpense) },
    { label: 'Current balance', value: formatCurrency(stats.balance) },
    { label: 'Total goals', value: goals.length },
    { label: 'Goals completed', value: completedGoals },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Navbar />

        <header className="rounded-xl bg-white p-6 shadow-md">
          <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>
          <p className="mt-1 text-sm text-gray-600">
            Review your account details and financial summary.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {isLoading ? (
          <Spinner className="justify-center" label="Loading profile..." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            <section className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-gray-900">Account</h2>
              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Name:</span> {user?.name || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {user?.email || 'N/A'}
                </p>
                <p>
                  <span className="font-medium">Created:</span> {createdAtLabel}
                </p>
              </div>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-md">
              <h2 className="text-lg font-semibold text-gray-900">Summary stats</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {summaryStats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-gray-100 bg-white p-6 shadow-md"
                  >
                    <p className="text-xs uppercase tracking-wide text-gray-500">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-lg font-semibold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
