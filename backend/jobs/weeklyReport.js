const cron = require('node-cron')
const Transaction = require('../models/Transaction')
const User = require('../models/User')
const Goal = require('../models/Goal')
const { getEmotionalInsights, getFinancialNudges } = require('../services/openaiService')
const { sendWeeklyReport } = require('../services/emailService')

const buildWeeklyStats = (transactions = [], goals = []) => {
  const safeTransactions = Array.isArray(transactions) ? transactions : []
  let totalIncome = 0
  let totalExpense = 0

  safeTransactions.forEach((transaction) => {
    const amount = Number(transaction?.amount) || 0
    if (transaction?.type === 'income') {
      totalIncome += amount
    } else if (transaction?.type === 'expense') {
      totalExpense += amount
    }
  })

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    goals: Array.isArray(goals) ? goals : [],
  }
}

const runWeeklyReports = async () => {
  const users = await User.find().select('name email')
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - 7)

  for (const user of users) {
    try {
      const [transactions, goals] = await Promise.all([
        Transaction.find({ userId: user._id, date: { $gte: cutoffDate } }).sort({ date: -1 }),
        Goal.find({ userId: user._id }).sort({ deadline: 1 }),
      ])

      const stats = buildWeeklyStats(transactions, goals)

      const [insightsResult, nudgesResult] = await Promise.allSettled([
        getEmotionalInsights(transactions),
        getFinancialNudges(transactions, goals),
      ])

      const insights =
        insightsResult.status === 'fulfilled' && Array.isArray(insightsResult.value)
          ? insightsResult.value
          : []
      const nudges =
        nudgesResult.status === 'fulfilled' && Array.isArray(nudgesResult.value)
          ? nudgesResult.value
          : []

      await sendWeeklyReport(user, stats, insights, nudges)
    } catch (error) {
      console.error(`Failed to send weekly report for user ${user._id}:`, error)
    }
  }
}

const scheduleWeeklyReports = () => {
  // Run every Sunday at 8:00 AM.
  cron.schedule('0 8 * * 0', () => {
    runWeeklyReports().catch((error) => {
      console.error('Weekly report job failed:', error)
    })
  })
}

module.exports = scheduleWeeklyReports
