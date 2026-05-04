import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
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

    try {
      const [transactionData, statsData] = await Promise.all([
        getTransactions(token),
        getStats(token),
      ])
      setTransactions(transactionData)
      setStats(statsData)
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions')
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
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    setError('')

    try {
      await deleteTransaction(id, token)
      await loadTransactions()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete transaction')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <Navbar />

        <header className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-300">
            Welcome back{user?.name ? `, ${user.name}` : ''}! Track your income and
            expenses below.
          </p>
        </header>

        {error ? (
          <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
            <p className="text-xs uppercase tracking-widest text-emerald-200">Total income</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-100">
              ${Number(stats.totalIncome || 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-5">
            <p className="text-xs uppercase tracking-widest text-red-200">Total expense</p>
            <p className="mt-2 text-2xl font-semibold text-red-100">
              ${Number(stats.totalExpense || 0).toFixed(2)}
            </p>
          </div>
          <div className="rounded-2xl border border-sky-400/30 bg-sky-500/10 p-5">
            <p className="text-xs uppercase tracking-widest text-sky-200">Balance</p>
            <p className="mt-2 text-2xl font-semibold text-sky-100">
              ${Number(stats.balance || 0).toFixed(2)}
            </p>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <h2 className="text-xl font-semibold">Add a transaction</h2>
          <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
            <label className="block text-sm">
              <span className="text-slate-300">Title</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Amount</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                type="number"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Type</span>
              <select
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                value={type}
                onChange={(event) => setType(event.target.value)}
                required
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Category</span>
              <select
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
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
              <span className="text-slate-300">Note</span>
              <textarea
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                rows={3}
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </label>

            <label className="block text-sm">
              <span className="text-slate-300">Date</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950/50 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>

            <div className="flex items-end md:justify-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 md:w-auto"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Add transaction'}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Transactions</h2>
            {isLoading ? <span className="text-xs text-slate-400">Loading...</span> : null}
          </div>
          {transactions.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">No transactions yet.</p>
          ) : (
            <ul className="mt-4 overflow-hidden rounded-xl border border-slate-800">
              {transactions.map((transaction, index) => {
                const isIncome = transaction.type === 'income'
                return (
                  <li
                    key={transaction._id}
                    className={`flex flex-col gap-3 p-4 text-sm md:flex-row md:items-center md:justify-between ${
                      index % 2 === 0 ? 'bg-slate-900/60' : 'bg-slate-900/30'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-100">{transaction.title}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {transaction.category} ·{' '}
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          isIncome
                            ? 'bg-emerald-500/20 text-emerald-200'
                            : 'bg-red-500/20 text-red-200'
                        }`}
                      >
                        {transaction.type}
                      </span>
                      <span className={isIncome ? 'text-emerald-200' : 'text-red-200'}>
                        {isIncome ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDelete(transaction._id)}
                        className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-red-400 hover:text-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

export default Dashboard
