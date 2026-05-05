const mongoose = require('mongoose')
const Goal = require('../models/Goal')

const createGoal = async (req, res) => {
  try {
    const { title, targetAmount, deadline, category } = req.body

    if (!title || targetAmount == null || !deadline || !category) {
      return res
        .status(400)
        .json({ message: 'Title, target amount, deadline, and category are required' })
    }

    const parsedTarget = Number(targetAmount)

    if (!Number.isFinite(parsedTarget) || parsedTarget <= 0) {
      return res.status(400).json({ message: 'Target amount must be greater than zero' })
    }

    const parsedDeadline = new Date(deadline)

    if (Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: 'Deadline must be a valid date' })
    }

    const goal = await Goal.create({
      userId: req.user.id,
      title: title.trim(),
      targetAmount: parsedTarget,
      deadline: parsedDeadline,
      category,
    })

    return res.status(201).json(goal)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create goal' })
  }
}

const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user.id }).sort({ createdAt: -1 })
    return res.status(200).json(goals)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to fetch goals' })
  }
}

const updateGoalProgress = async (req, res) => {
  try {
    const { id } = req.params
    const { amount } = req.body

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid goal id' })
    }

    const parsedAmount = Number(amount)

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than zero' })
    }

    const goal = await Goal.findOne({ _id: id, userId: req.user.id })

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    goal.savedAmount += parsedAmount

    if (goal.savedAmount >= goal.targetAmount) {
      goal.isCompleted = true
    }

    await goal.save()

    return res.status(200).json(goal)
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update goal progress' })
  }
}

const deleteGoal = async (req, res) => {
  try {
    const { id } = req.params

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid goal id' })
    }

    const goal = await Goal.findOneAndDelete({ _id: id, userId: req.user.id })

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' })
    }

    return res.status(200).json({ message: 'Goal deleted' })
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete goal' })
  }
}

module.exports = {
  createGoal,
  getGoals,
  updateGoalProgress,
  deleteGoal,
}
