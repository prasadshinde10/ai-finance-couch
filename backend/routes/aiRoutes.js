const express = require('express')
const rateLimit = require('express-rate-limit')
const auth = require('../middleware/auth')
const { getBudgetPrediction, getInsights, getNudges } = require('../controllers/aiController')

const router = express.Router()

// Limit AI requests to 20 per 15 minutes to control usage costs.
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
})

router.use(aiLimiter)
router.use(auth)

router.get('/budget-prediction', getBudgetPrediction)
router.get('/insights', getInsights)
router.get('/nudges', getNudges)

module.exports = router
