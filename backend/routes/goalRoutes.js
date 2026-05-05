const express = require('express')
const auth = require('../middleware/auth')
const {
  createGoal,
  getGoals,
  updateGoalProgress,
  deleteGoal,
} = require('../controllers/goalController')

const router = express.Router()

router.use(auth)

router.post('/', createGoal)
router.get('/', getGoals)
router.put('/:id/progress', updateGoalProgress)
router.delete('/:id', deleteGoal)

module.exports = router
