import { useCallback, useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import {
  createGoal,
  deleteGoal,
  getGoals,
  updateGoalProgress,
} from '../api/goalApi'

const categories = [
  'emergency',
  'travel',
  'education',
  'gadget',
  'house',
  'vehicle',
  'other',
]

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const formatDate = (value) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return 'N/A'
  }
  return parsed.toLocaleDateString()
}

const getDefaultDeadline = () => {
  const next = new Date()
  next.setDate(next.getDate() + 30)
  return next.toISOString().split('T')[0]
}

const Goals = () => {
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState(() => getDefaultDeadline())
  const [category, setCategory] = useState('emergency')
  const [goals, setGoals] = useState([])
  const [progressInputs, setProgressInputs] = useState({})
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [progressGoalId, setProgressGoalId] = useState(null)
  const [deleteGoalId, setDeleteGoalId] = useState(null)

  const loadGoals = useCallback(async () => {
    if (!token) {
      return
    }

    try {
      const data = await getGoals(token)
      setGoals(Array.isArray(data) ? data : [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load goals')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadGoals()
  }, [loadGoals])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await createGoal(
        {
          title,
          targetAmount: Number(targetAmount),
          deadline,
          category,
        },
        token
      )
      setTitle('')
      setTargetAmount('')
      setDeadline(getDefaultDeadline())
      setCategory('emergency')
      await loadGoals()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create goal')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProgressChange = (id, value) => {
    setProgressInputs((prev) => ({ ...prev, [id]: value }))
  }

  const handleAddProgress = async (id) => {
    const rawAmount = progressInputs[id]
    const parsedAmount = Number(rawAmount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount to add')
      return
    }

    setError('')
    setProgressGoalId(id)

    try {
      await updateGoalProgress(id, parsedAmount, token)
      setProgressInputs((prev) => ({ ...prev, [id]: '' }))
      await loadGoals()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update progress')
    } finally {
      setProgressGoalId(null)
    }
  }

  const handleDelete = async (id) => {
    setError('')
    setDeleteGoalId(id)

    try {
      await deleteGoal(id, token)
      await loadGoals()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete goal')
    } finally {
      setDeleteGoalId(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Navbar />

        <header className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <h1 className="text-3xl font-semibold">Goals</h1>
          <p className="mt-2 text-sm text-slate-300">
            Set savings targets and track progress every week.
          </p>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="rounded-2xl bg-white p-6 text-slate-900 shadow-lg">
          <h2 className="text-xl font-semibold">Create a new goal</h2>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block text-sm">
              <span className="text-slate-600">Title</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-600">Target Amount</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                type="number"
                step="0.01"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-600">Deadline</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                type="date"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-600">Category</span>
              <select
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                required
              >
                {categories.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end md:justify-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Create goal'}
              </button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your goals</h2>
            {isLoading ? <span className="text-xs text-slate-400">Loading...</span> : null}
          </div>

          {goals.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
              No goals yet. Create one above to get started.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {goals.map((goal) => {
                const target = Number(goal.targetAmount) || 0
                const saved = Number(goal.savedAmount) || 0
                const progress =
                  target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0
                const isCompleted = Boolean(goal.isCompleted)
                const cardStyles = isCompleted
                  ? 'border-emerald-200 bg-emerald-50 text-slate-900'
                  : 'border-slate-200 bg-white text-slate-900 shadow-lg'

                return (
                  <div
                    key={goal._id}
                    className={`rounded-2xl border p-5 transition ${cardStyles}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold">{goal.title}</h3>
                        <p className="text-xs uppercase tracking-wide text-slate-500">
                          {goal.category}
                        </p>
                      </div>
                      {isCompleted ? (
                        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-700">
                          Completed
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-semibold text-slate-900">{progress}%</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full bg-sky-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-sm text-slate-600">
                        {formatCurrency(saved)} saved of {formatCurrency(target)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Deadline: {formatDate(goal.deadline)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-col gap-3">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <input
                          className="w-full flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                          type="number"
                          step="0.01"
                          placeholder="Amount to add"
                          value={progressInputs[goal._id] || ''}
                          onChange={(event) => handleProgressChange(goal._id, event.target.value)}
                          disabled={isCompleted}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddProgress(goal._id)}
                          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
                          disabled={isCompleted || progressGoalId === goal._id}
                        >
                          {progressGoalId === goal._id ? 'Updating...' : 'Add Progress'}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete(goal._id)}
                        className="w-full rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        disabled={deleteGoalId === goal._id}
                      >
                        {deleteGoalId === goal._id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default Goals
