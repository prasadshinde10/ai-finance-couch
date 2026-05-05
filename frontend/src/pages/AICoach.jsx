import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { toast } from 'react-hot-toast'
import { getBudgetPrediction, getInsights, getNudges } from '../api/aiApi'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
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

const hashString = (value = '') => {
  let hash = 0
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index)
    hash |= 0
  }
  return Math.abs(hash).toString(36)
}

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
      const message = err.response?.data?.message || 'Failed to predict budget'
      setBudgetError(message)
      toast.error(message)
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
      const message = err.response?.data?.message || 'Failed to analyze spending'
      setInsightsError(message)
      toast.error(message)
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
        const message = err.response?.data?.message || 'Failed to load nudges'
        setNudgesError(message)
        toast.error(message)
      } finally {
        setNudgesLoading(false)
      }
    }

    loadNudges()
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Navbar />

        <header className="rounded-xl bg-white p-6 shadow-md">
          <h1 className="text-2xl font-semibold text-gray-900">AI Coach</h1>
          <p className="mt-2 text-sm text-gray-600">
            Get predictive budgets, emotional spending insights, and personalized nudges.
          </p>
        </header>

        <section className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Predictive Budget</h2>
              <p className="mt-1 text-sm text-gray-600">
                Forecast next month&apos;s budget based on your last 30 days.
              </p>
            </div>
            <button
              type="button"
              onClick={handlePredictBudget}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={budgetLoading}
            >
              Predict My Budget
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {budgetLoading ? <Spinner label="Analyzing..." /> : null}
            {budgetError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {budgetError}
              </div>
            ) : null}

            {budgetRows.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Suggested Limit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgetRows.map((row, index) => (
                        <tr
                          key={row.category}
                          className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                        >
                          <td className="px-4 py-3 capitalize">{row.category}</td>
                          <td className="px-4 py-3">{formatRupees(row.limit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="h-64 rounded-xl border border-gray-200 bg-white p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={budgetRows}>
                      <XAxis
                        dataKey="category"
                        stroke="#6b7280"
                        label={{ value: 'Category', position: 'insideBottom', offset: -5 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        label={{ value: 'Suggested Limit (₹)', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        cursor={{ fill: 'rgba(229, 231, 235, 0.6)' }}
                        formatter={(value) => formatRupees(value)}
                      />
                      <Bar dataKey="limit" fill="#2563eb" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : null}
            {!budgetLoading && budgetRows.length === 0 ? (
              <p className="text-sm text-gray-500">Click the button to generate a budget.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Emotional Spending Insights</h2>
              <p className="mt-1 text-sm text-gray-600">
                Discover emotional or impulsive patterns in your spending.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAnalyzeSpending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={insightsLoading}
            >
              Analyze My Spending
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {insightsLoading ? <Spinner label="Analyzing..." /> : null}
            {insightsError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {insightsError}
              </div>
            ) : null}

            {insights.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {insights.map((insight) => (
                  <div
                    key={`insight-${hashString(insight)}`}
                    className="rounded-xl border border-blue-100 bg-white p-6 text-sm font-medium text-gray-900 shadow-md"
                  >
                    {insight}
                  </div>
                ))}
              </div>
            ) : null}
            {!insightsLoading && insights.length === 0 ? (
              <p className="text-sm text-gray-500">Run an analysis to see insights.</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-md">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Financial Nudges</h2>
            <p className="mt-1 text-sm text-gray-600">
              Personalized tips based on your spending and goals.
            </p>
          </div>

          <div className="mt-4 space-y-4">
            {nudgesLoading ? <Spinner label="Analyzing..." /> : null}
            {nudgesError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                {nudgesError}
              </div>
            ) : null}

            {nudges.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-3">
                {nudges.map((nudge) => (
                  <div
                    key={`nudge-${hashString(nudge)}`}
                    className="rounded-xl border border-green-100 bg-white p-6 text-sm font-medium text-gray-900 shadow-md"
                  >
                    <span className="mr-2">💡</span>
                    {nudge}
                  </div>
                ))}
              </div>
            ) : null}
            {!nudgesLoading && nudges.length === 0 ? (
              <p className="text-sm text-gray-500">Fetching your nudges now.</p>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  )
}

export default AICoach
