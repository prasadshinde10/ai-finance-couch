import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Spinner from '../components/Spinner'
import {
  addTransaction,
  deleteTransaction,
  getStats,
  getTransactions,
} from '../api/transactionApi'

const categories = [
  'food',
  'shopping',
  'entertainment',
  'transport',
  'health',
  'education',
  'salary',
  'other',
]

const pieColors = ['#2563eb', '#f97316', '#22c55e', '#e11d48', '#8b5cf6', '#14b8a6']

const Dashboard = () => {
  const { user, token } = useAuth()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [type, setType] = useState('expense')
  const [category, setCategory] = useState('food')
  const [note, setNote] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState({ totalIncome: 0, totalExpense: 0, balance: 0 })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadTransactions = useCallback(async () => {
    if (!token) {
      return
    }

    setIsLoading(true)
    try {
      const [transactionData, statsData] = await Promise.all([
        getTransactions(token),
        getStats(token),
      ])
      setTransactions(transactionData)
      setStats(statsData)
      setError('')
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to load transactions'
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTransactions()
  }, [loadTransactions])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await addTransaction(
        {
          title,
          amount: Number(amount),
          type,
          category,
          note: note.trim() || undefined,
          date: date || undefined,
        },
        token
      )
      setTitle('')
      setAmount('')
      setNote('')
      await loadTransactions()
      toast.success('Transaction added')
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add transaction'
      setError(message)
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setError('')

    try {
      await deleteTransaction(id, token)
      await loadTransactions()
      toast.success('Transaction deleted')
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete transaction'
      setError(message)
      toast.error(message)
    }
  }

  const expenseTrendData = useMemo(() => {
    const today = new Date()
    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      return {
        key: date.toLocaleDateString('en-CA'),
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        total: 0,
      }
    })
    const dayMap = new Map(days.map((day) => [day.key, day]))
    transactions.forEach((transaction) => {
      if (transaction.type !== 'expense') {
        return
      }
      const dateKey = new Date(transaction.date).toLocaleDateString('en-CA')
      const match = dayMap.get(dateKey)
      if (match) {
        match.total += Number(transaction.amount) || 0
      }
    })
    return days
  }, [transactions])

  const hasExpenseTrend = expenseTrendData.some((item) => item.total > 0)

  const incomeExpenseData = useMemo(
    () => [
      { name: 'Income', amount: Number(stats.totalIncome || 0) },
      { name: 'Expense', amount: Number(stats.totalExpense || 0) },
    ],
    [stats]
  )

  const expenseByCategory = useMemo(() => {
    const totals = transactions.reduce((acc, transaction) => {
      if (transaction.type !== 'expense') {
        return acc
      }
      const category = transaction.category || 'Other'
      acc[category] = (acc[category] || 0) + Number(transaction.amount || 0)
      return acc
    }, {})
    return Object.entries(totals).map(([name, value]) => ({ name, value }))
  }, [transactions])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Navbar />

        <header className="rounded-xl bg-white p-6 shadow-md">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Track your income and
            expenses below.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-widest text-gray-500">Total income</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              ${Number(stats.totalIncome || 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-widest text-gray-500">Total expense</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              ${Number(stats.totalExpense || 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-md">
            <p className="text-xs uppercase tracking-widest text-gray-500">Balance</p>
            <p className="mt-2 text-2xl font-semibold text-gray-900">
              ${Number(stats.balance || 0).toFixed(2)}
            </p>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Expense Trend</h2>
            <div className="mt-4 h-64">
              {isLoading ? (
                <Spinner className="h-full justify-center" label="Loading chart..." />
              ) : hasExpenseTrend ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={expenseTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Line type="monotone" dataKey="total" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">No expense data for the last 7 days.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900">Income vs Expense</h2>
            <div className="mt-4 h-64">
              {isLoading ? (
                <Spinner className="h-full justify-center" label="Loading chart..." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeExpenseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip />
                    <Bar dataKey="amount">
                      <Cell fill="#22c55e" />
                      <Cell fill="#ef4444" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white p-6 shadow-md">
            <h2 className="text-lg font-semibold text-gray-900">Expense by Category</h2>
            <div className="mt-4 h-64">
              {isLoading ? (
                <Spinner className="h-full justify-center" label="Loading chart..." />
              ) : expenseByCategory.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                    >
                      {expenseByCategory.map((entry, index) => (
                        <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Legend verticalAlign="bottom" align="center" />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500">No expense categories yet.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-md">
          <h2 className="text-lg font-semibold text-gray-900">Add a transaction</h2>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block text-sm">
              <span className="text-gray-600">Title</span>
              <input
                className="mt-2 w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="text-gray-600">Amount</span>
              <input
                className="mt-2 w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="text-gray-600">Type</span>
              <select
                className="mt-2 w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={type}
                onChange={(event) => setType(event.target.value)}
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-gray-600">Category</span>
              <select
                className="mt-2 w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <label className="block text-sm md:col-span-2">
              <span className="text-gray-600">Note</span>
              <textarea
                className="mt-2 w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>

            <label className="block text-sm">
              <span className="text-gray-600">Date</span>
              <input
                className="mt-2 w-full rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>

            <div className="flex items-end md:justify-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Add transaction'}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-xl bg-white p-6 shadow-md">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Transactions</h2>
            {isLoading ? <Spinner label="Loading..." /> : null}
          </div>
          {!isLoading && transactions.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No transactions yet.</p>
          ) : null}
          {transactions.length > 0 ? (
            <ul className="mt-4 overflow-hidden rounded-xl border border-gray-200">
              {transactions.map((transaction, index) => {
                const isIncome = transaction.type === 'income'
                return (
                  <li
                    key={transaction._id}
                    className={`flex flex-col gap-3 p-4 text-sm md:flex-row md:items-center md:justify-between ${
                      index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{transaction.title}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {transaction.category} ·{' '}
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {transaction.type}
                      </span>
                      <span className={isIncome ? 'text-green-600' : 'text-red-600'}>
                        {isIncome ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(transaction._id)}
                        className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white transition hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : null}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
