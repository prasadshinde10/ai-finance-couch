const express = require('express')
const auth = require('../middleware/auth')
const { getBudgetPrediction, getInsights, getNudges } = require('../controllers/aiController')

const router = express.Router()

router.use(auth)

router.get('/budget-prediction', getBudgetPrediction)
router.get('/insights', getInsights)
router.get('/nudges', getNudges)

module.exports = router
