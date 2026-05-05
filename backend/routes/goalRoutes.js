const express = require('express')
const rateLimit = require('express-rate-limit')
const auth = require('../middleware/auth')
const {
  createGoal,
  getGoals,
  updateGoalProgress,
  deleteGoal,
} = require('../controllers/goalController')

const router = express.Router()

const goalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})

router.use(goalLimiter)
router.use(auth)

router.post('/', createGoal)
router.get('/', getGoals)
router.put('/:id/progress', updateGoalProgress)
router.delete('/:id', deleteGoal)

module.exports = router
