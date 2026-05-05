const nodemailer = require('nodemailer')

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return map[char] || char
  })

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0)

const getTransporter = () => {
  const { EMAIL_USER, EMAIL_PASS } = process.env

  if (!EMAIL_USER || !EMAIL_PASS) {
    throw new Error('EMAIL_USER and EMAIL_PASS are not set')
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  })
}

const renderList = (items, fallback) => {
  const safeItems = Array.isArray(items) ? items.filter(Boolean).slice(0, 3) : []

  if (safeItems.length === 0) {
    return `<p style="margin: 8px 0 0; color: #64748b;">${escapeHtml(fallback)}</p>`
  }

  return `<ul style="margin: 8px 0 0; padding-left: 20px; color: #0f172a;">
    ${safeItems.map((item) => `<li style="margin-bottom: 6px;">${escapeHtml(item)}</li>`).join('')}
  </ul>`
}

const renderGoalSummary = (goals = []) => {
  const safeGoals = Array.isArray(goals) ? goals : []

  if (safeGoals.length === 0) {
    return `<p style="margin: 8px 0 0; color: #64748b;">No active goals yet.</p>`
  }

  const rows = safeGoals
    .map((goal) => {
      const targetAmount = Number(goal?.targetAmount) || 0
      const savedAmount = Number(goal?.savedAmount) || 0
      const progress = targetAmount > 0 ? Math.min(100, Math.round((savedAmount / targetAmount) * 100)) : 0
      const status = goal?.isCompleted ? 'Completed' : 'In progress'

      return `
        <tr>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0;">
            ${escapeHtml(goal?.title || 'Untitled goal')}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">
            ${formatCurrency(savedAmount)} / ${formatCurrency(targetAmount)}
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">
            ${progress}%
          </td>
          <td style="padding: 10px 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">
            ${escapeHtml(status)}
          </td>
        </tr>
      `
    })
    .join('')

  return `
    <table style="width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 14px;">
      <thead>
        <tr style="background: #f1f5f9; color: #0f172a;">
          <th style="padding: 10px 8px; text-align: left;">Goal</th>
          <th style="padding: 10px 8px; text-align: right;">Progress</th>
          <th style="padding: 10px 8px; text-align: right;">% Complete</th>
          <th style="padding: 10px 8px; text-align: right;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `
}

const sendWeeklyReport = async (user, stats = {}, insights = [], nudges = []) => {
  const transporter = getTransporter()
  const { EMAIL_USER } = process.env
  const userName = user?.name ? escapeHtml(user.name) : 'there'
  const totalIncome = Number(stats.totalIncome) || 0
  const totalExpense = Number(stats.totalExpense) || 0
  const balance = Number(stats.balance) || 0
  const goals = stats.goals || []

  const html = `
    <div style="font-family: 'Segoe UI', sans-serif; background: #f8fafc; padding: 24px; color: #0f172a;">
      <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #e2e8f0;">
        <h2 style="margin-top: 0;">Hi ${userName},</h2>
        <p style="color: #475569;">Here is your weekly finance snapshot.</p>

        <h3 style="margin-bottom: 8px;">Weekly Summary</h3>
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Income</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${formatCurrency(
              totalIncome
            )}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Expenses</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${formatCurrency(
              totalExpense
            )}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #64748b;">Balance</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600;">${formatCurrency(
              balance
            )}</td>
          </tr>
        </table>

        <h3 style="margin: 24px 0 8px;">Emotional Insights</h3>
        ${renderList(insights, 'No insights generated this week.')}

        <h3 style="margin: 24px 0 8px;">Financial Nudges</h3>
        ${renderList(nudges, 'No nudges generated this week.')}

        <h3 style="margin: 24px 0 8px;">Goal Progress</h3>
        ${renderGoalSummary(goals)}
      </div>
    </div>
  `

  return transporter.sendMail({
    from: EMAIL_USER,
    to: user?.email,
    subject: 'Your Weekly Finance Report',
    html,
  })
}

module.exports = { sendWeeklyReport }
