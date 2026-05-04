const mongoose = require('mongoose')
const Transaction = require('../models/Transaction')

const addTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, note, date } = req.body

    if (!title || amount == null || !type || !category) {
      return res.status(400).json({ message: 'Title, amount, type, and category are required' })
    }

    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' })
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      title,
      amount: parsedAmount,
      type,
      category,
      note,
      date,
    })

    return res.status(201).json(transaction)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to add transaction' })
  }
}

const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user.id }).sort({ date: -1 })
    return res.status(200).json(transactions)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch transactions' })
  }
}

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid transaction id' })
    }

    const transaction = await Transaction.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    })

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' })
    }

    return res.status(200).json({ message: 'Transaction deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete transaction' })
  }
}

const getStats = async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id)
    const [stats] = await Transaction.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
          },
          totalExpense: {
            $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
          },
        },
      },
    ])

    const totalIncome = stats?.totalIncome ?? 0
    const totalExpense = stats?.totalExpense ?? 0
    const balance = totalIncome - totalExpense

    return res.status(200).json({
      totalIncome,
      totalExpense,
      balance,
    })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch stats' })
  }
}

module.exports = {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getStats,
}
