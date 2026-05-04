const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\\S+@\\S+\\.\\S+$/, 'Please provide a valid email address'],
  },
  password: { type: String, required: true },
  goals: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
})

module.exports = mongoose.model('User', userSchema)
