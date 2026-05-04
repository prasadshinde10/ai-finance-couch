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
  const prompt = `Based on these transactions, predict next month's budget category-wise. Return JSON with categories and suggested limits in rupees.\nTransactions: ${JSON.stringify(
    transactions
  )}`
  return createCompletion(prompt)
}

const getEmotionalInsights = async (transactions) => {
  const prompt = `Analyze these spending patterns and identify emotional or impulsive spending behavior. Give 3 short insights in simple English with emoji. Return as JSON array of strings.\nTransactions: ${JSON.stringify(
    transactions
  )}`
  return createCompletion(prompt)
}

const getFinancialNudges = async (transactions, goals) => {
  const prompt = `Based on spending history and financial goals, give 3 personalized financial nudges or tips to improve money habits. Keep each tip under 2 lines. Return as JSON array of strings.\nTransactions: ${JSON.stringify(
    transactions
  )}\nGoals: ${JSON.stringify(goals)}`
  return createCompletion(prompt)
}

module.exports = {
  getPredictiveBudget,
  getEmotionalInsights,
  getFinancialNudges,
}
