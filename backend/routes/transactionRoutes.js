const express = require('express')
const auth = require('../middleware/auth')
const {
  addTransaction,
  getTransactions,
  deleteTransaction,
  getStats,
} = require('../controllers/transactionController')

const router = express.Router()

router.use(auth)

router.post('/', addTransaction)
router.get('/', getTransactions)
router.get('/stats', getStats)
router.delete('/:id', deleteTransaction)

module.exports = router
