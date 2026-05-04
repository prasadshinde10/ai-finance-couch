const jwt = require('jsonwebtoken')

const auth = (req, res, next) => {
  const authHeader = req.header('Authorization')

  if (!authHeader) {
    return res.status(401).json({ message: 'Authorization token required' })
  }

  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Invalid authorization format' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    return next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

module.exports = auth
