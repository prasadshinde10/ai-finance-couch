const mongoose = require('mongoose')
const Transaction = require('../models/Transaction')

const addTransaction = async (req, res) => {
  try {
    const { title, amount, type, category, note, date } = req.body

    if (!title || amount === undefined || !type || !category) {
      return res.status(400).json({ message: 'Title, amount, type, and category are required' })
    }

    const transaction = await Transaction.create({
      userId: req.user.id,
      title,
      amount,
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
    const transactions = await Transaction.find({ userId: req.user.id }).select('amount type')

    const totals = transactions.reduce(
      (accumulator, transaction) => {
        if (transaction.type === 'income') {
          accumulator.totalIncome += transaction.amount
        } else if (transaction.type === 'expense') {
          accumulator.totalExpense += transaction.amount
        }

        return accumulator
      },
      { totalIncome: 0, totalExpense: 0 }
    )

    const balance = totals.totalIncome - totals.totalExpense

    return res.status(200).json({
      totalIncome: totals.totalIncome,
      totalExpense: totals.totalExpense,
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
