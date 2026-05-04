const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const createToken = (user) => {
  const { JWT_SECRET, JWT_EXPIRES_IN = '7d' } = process.env

  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set')
  }

  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const normalizedEmail = email.toLowerCase()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
    })

    const token = createToken(user)

    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    if (error.message === 'JWT_SECRET is not set') {
      return res.status(500).json({ message: 'Server configuration error' })
    }

    return res.status(500).json({ message: 'Registration failed' })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const normalizedEmail = email.toLowerCase()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = createToken(user)

    return res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    })
  } catch (error) {
    if (error.message === 'JWT_SECRET is not set') {
      return res.status(500).json({ message: 'Server configuration error' })
    }

    return res.status(500).json({ message: 'Login failed' })
  }
}

module.exports = { register, login }
