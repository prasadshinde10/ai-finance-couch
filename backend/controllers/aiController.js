const Transaction = require('../models/Transaction')
const User = require('../models/User')
const {
  getPredictiveBudget,
  getEmotionalInsights,
  getFinancialNudges,
} = require('../services/openaiService')

const handleAiError = (res, error, fallbackMessage) => {
  console.error(fallbackMessage, error)

  if (error?.message === 'OPENAI_API_KEY is not set') {
    return res.status(500).json({ message: 'OpenAI configuration error' })
  }

  if (error?.message === 'No response from OpenAI') {
    return res.status(502).json({ message: 'OpenAI service unavailable' })
  }

  if (error instanceof SyntaxError) {
    return res.status(502).json({ message: 'Invalid response from OpenAI' })
  }

  return res.status(500).json({ message: fallbackMessage })
}

const getBudgetPrediction = async (req, res) => {
  try {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 30)

    const transactions = await Transaction.find({
      userId: req.user.id,
      date: { $gte: cutoffDate },
    }).sort({ date: -1 })

    const prediction = await getPredictiveBudget(transactions)
    return res.status(200).json(prediction)
  } catch (error) {
    return handleAiError(res, error, 'Failed to generate budget prediction')
  }
}

const getInsights = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 })
    const insights = await getEmotionalInsights(transactions)
    return res.status(200).json(insights)
  } catch (error) {
    return handleAiError(res, error, 'Failed to generate insights')
  }
}

const getNudges = async (req, res) => {
  try {
    const [transactions, user] = await Promise.all([
      Transaction.find({ userId: req.user.id }).sort({ date: -1 }),
      User.findById(req.user.id).select('goals'),
    ])

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const nudges = await getFinancialNudges(transactions, user.goals || [])
    return res.status(200).json(nudges)
  } catch (error) {
    return handleAiError(res, error, 'Failed to generate nudges')
  }
}

module.exports = {
  getBudgetPrediction,
  getInsights,
  getNudges,
}
