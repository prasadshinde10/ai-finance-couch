const OpenAI = require('openai')

const getClient = () => {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set')
  }

  return new OpenAI({ apiKey })
}

const extractJson = (content) => {
  const trimmed = content.trim()
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)
  const jsonPayload = fencedMatch ? fencedMatch[1].trim() : trimmed
  return JSON.parse(jsonPayload)
}

const summarizeTransactions = (transactions = []) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return {
      transactionCount: 0,
      totalIncome: 0,
      totalExpense: 0,
      totalsByCategory: {},
      dateRange: null,
    }
  }

  let totalIncome = 0
  let totalExpense = 0
  let minDate = null
  let maxDate = null
  const totalsByCategory = {}

  transactions.forEach((transaction) => {
    if (!transaction || typeof transaction !== 'object') {
      return
    }

    const category = transaction.category || 'uncategorized'
    const parsedAmount = Number(transaction.amount)
    const amount = Number.isFinite(parsedAmount) ? parsedAmount : 0
    const bucket = totalsByCategory[category] || { income: 0, expense: 0, count: 0 }

    if (transaction.type === 'income') {
      bucket.income += amount
      totalIncome += amount
    } else if (transaction.type === 'expense') {
      bucket.expense += amount
      totalExpense += amount
    }

    bucket.count += 1
    totalsByCategory[category] = bucket

    if (transaction.date) {
      const parsedDate = new Date(transaction.date)
      if (!Number.isNaN(parsedDate.getTime())) {
        if (!minDate || parsedDate < minDate) {
          minDate = parsedDate
        }
        if (!maxDate || parsedDate > maxDate) {
          maxDate = parsedDate
        }
      }
    }
  })

  return {
    transactionCount: transactions.length,
    totalIncome,
    totalExpense,
    totalsByCategory,
    dateRange: minDate && maxDate ? { from: minDate.toISOString(), to: maxDate.toISOString() } : null,
  }
}

const createCompletion = async (prompt) => {
  const client = getClient()
  const model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  const response = await client.chat.completions.create({
    model,
    messages: [
      {
        role: 'system',
        content: 'You are a helpful financial coach who responds with clean JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    temperature: 0.3,
  })

  const content = response?.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response from OpenAI')
  }

  return extractJson(content)
}

const getPredictiveBudget = async (transactions) => {
  const summary = summarizeTransactions(transactions)
  const prompt = `Based on these transactions, predict next month's budget category-wise. Return JSON with categories and suggested limits in rupees.\nTransaction summary: ${JSON.stringify(
    summary
  )}`
  return createCompletion(prompt)
}

const getEmotionalInsights = async (transactions) => {
  const summary = summarizeTransactions(transactions)
  const prompt = `Analyze these spending patterns and identify emotional or impulsive spending behavior. Give 3 short insights in simple English with emoji. Return as JSON array of strings.\nTransaction summary: ${JSON.stringify(
    summary
  )}`
  return createCompletion(prompt)
}

const getFinancialNudges = async (transactions, goals) => {
  const summary = summarizeTransactions(transactions)
  const safeGoals = Array.isArray(goals) ? goals : []
  const prompt = `Based on spending history and financial goals, give 3 personalized financial nudges or tips to improve money habits. Keep each tip under 2 lines. Return as JSON array of strings.\nTransaction summary: ${JSON.stringify(
    summary
  )}\nGoals: ${JSON.stringify(safeGoals)}`
  return createCompletion(prompt)
}

module.exports = {
  getPredictiveBudget,
  getEmotionalInsights,
  getFinancialNudges,
}
