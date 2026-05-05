import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getBudgetPrediction, getInsights, getNudges } from '../api/aiApi'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

const normalizeBudgetData = (data) => {
  if (!data) {
    return []
  }

  const parseItem = (item) => {
    if (!item || typeof item !== 'object') {
      return null
    }

    const category = item.category || item.name || item.label
    const limitValue =
      item.limit ?? item.amount ?? item.value ?? item.suggestedLimit ?? item.budget

    if (!category) {
      return null
    }

    const limit = Number(limitValue)
    return { category, limit: Number.isFinite(limit) ? limit : 0 }
  }

  if (Array.isArray(data)) {
    return data.map(parseItem).filter(Boolean)
  }

  if (data.categories) {
    if (Array.isArray(data.categories)) {
      return data.categories.map(parseItem).filter(Boolean)
    }

    if (typeof data.categories === 'object') {
      return Object.entries(data.categories).map(([category, limit]) => ({
        category,
        limit: Number(limit) || 0,
      }))
    }
  }

  if (typeof data === 'object') {
    return Object.entries(data)
      .filter(([key]) => key !== 'categories')
      .map(([category, limit]) => ({
        category,
        limit: Number(limit) || 0,
      }))
  }

  return []
}

const formatRupees = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const LoadingIndicator = ({ label }) => (
  <div className="flex items-center gap-2 text-sm text-slate-400">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
    <span>{label}</span>
  </div>
)

const AICoach = () => {
  const { token } = useAuth()
  const [budgetData, setBudgetData] = useState(null)
  const [insights, setInsights] = useState([])
  const [nudges, setNudges] = useState([])
  const [budgetLoading, setBudgetLoading] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [nudgesLoading, setNudgesLoading] = useState(false)
  const [budgetError, setBudgetError] = useState('')
  const [insightsError, setInsightsError] = useState('')
  const [nudgesError, setNudgesError] = useState('')

  const budgetRows = useMemo(() => normalizeBudgetData(budgetData), [budgetData])

  const handlePredictBudget = async () => {
    setBudgetError('')
    setBudgetLoading(true)

    try {
      const data = await getBudgetPrediction(token)
      setBudgetData(data)
    } catch (err) {
      setBudgetError(err.response?.data?.message || 'Failed to predict budget')
    } finally {
      setBudgetLoading(false)
    }
  }

  const handleAnalyzeSpending = async () => {
    setInsightsError('')
    setInsightsLoading(true)

    try {
      const data = await getInsights(token)
      setInsights(Array.isArray(data) ? data : [])
    } catch (err) {
      setInsightsError(err.response?.data?.message || 'Failed to analyze spending')
    } finally {
      setInsightsLoading(false)
    }
  }

  useEffect(() => {
    const loadNudges = async () => {
      if (!token) {
        return
      }

      setNudgesError('')
      setNudgesLoading(true)

      try {
        const data = await getNudges(token)
        setNudges(Array.isArray(data) ? data : [])
      } catch (err) {
        setNudgesError(err.response?.data?.message || 'Failed to load nudges')
      } finally {
        setNudgesLoading(false)
      }
    }

    loadNudges()
  }, [token])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Navbar />

        <header className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <h1 className="text-3xl font-semibold">AI Coach</h1>
          <p className="mt-2 text-sm text-slate-300">
            Get predictive budgets, emotional spending insights, and personalized nudges.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Predictive Budget</h2>
              <p className="mt-1 text-sm text-slate-400">
                Forecast next month&apos;s budget based on your last 30 days.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePredictBudget}
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={budgetLoading}
            >
              Predict My Budget
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {budgetLoading ? <LoadingIndicator label="Analyzing..." /> : null}
            {budgetError ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {budgetError}
              </div>
            ) : null}

            {budgetRows.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                <div className="overflow-hidden rounded-xl border border-slate-800">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-900/80 text-slate-300">
                      <tr>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Suggested Limit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetRows.map((row, index) => (
                        <tr
                          key={row.category}
                          className={index % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/20'}
                        >
                          <td className="px-4 py-3 capitalize">{row.category}</td>
                          <td className="px-4 py-3">{formatRupees(row.limit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="h-64 rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetRows}>
                      <XAxis dataKey="category" stroke="#cbd5f5" />
                      <YAxis stroke="#cbd5f5" />
                      <Tooltip
                        cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                        formatter={(value) => formatRupees(value)}
                      />
                      <Bar dataKey="limit" fill="#34d399" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : !budgetLoading ? (
              <p className="text-sm text-slate-400">Click the button to generate a budget.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold">Emotional Spending Insights</h2>
              <p className="mt-1 text-sm text-slate-400">
                Discover emotional or impulsive patterns in your spending.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAnalyzeSpending}
              className="rounded-lg bg-amber-300 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={insightsLoading}
            >
              Analyze My Spending
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {insightsLoading ? <LoadingIndicator label="Analyzing..." /> : null}
            {insightsError ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {insightsError}
              </div>
            ) : null}

            {insights.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {insights.map((insight, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-yellow-100 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            ) : !insightsLoading ? (
              <p className="text-sm text-slate-400">Run an analysis to see insights.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <div>
            <h2 className="text-xl font-semibold">Financial Nudges</h2>
            <p className="mt-1 text-sm text-slate-400">
              Personalized tips based on your spending and goals.
            </p>
          </div>

          <div className="mt-4 space-y-4">
            {nudgesLoading ? <LoadingIndicator label="Analyzing..." /> : null}
            {nudgesError ? (
              <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-200">
                {nudgesError}
              </div>
            ) : null}

            {nudges.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {nudges.map((nudge, index) => (
                  <div
                    key={index}
                    className="rounded-xl bg-emerald-100 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm"
                  >
                    <span className="mr-2">💡</span>
                    {nudge}
                  </div>
                ))}
              </div>
            ) : !nudgesLoading ? (
              <p className="text-sm text-slate-400">Fetching your nudges now.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AICoach
