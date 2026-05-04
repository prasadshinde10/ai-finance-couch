const express = require('express')
const rateLimit = require('express-rate-limit')
const auth = require('../middleware/auth')
const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getStats,
} = require('../controllers/transactionController')

const router = express.Router()

const transactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
})

router.use(transactionLimiter)
router.use(auth)

router.post('/', addTransaction)
router.get('/stats', getStats)
router.get('/', getTransactions)
router.delete('/:id', deleteTransaction)

module.exports = router
