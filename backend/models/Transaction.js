const mongoose = require('mongoose')

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['income', 'expense'], required: true },
  category: {
    type: String,
    enum: [
      'food',
      'shopping',
      'entertainment',
      'transport',
      'health',
      'education',
      'salary',
      'other',
    ],
    required: true,
  },
  note: { type: String, trim: true },
  date: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Transaction', transactionSchema)
