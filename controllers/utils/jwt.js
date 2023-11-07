const jwt = require('jsonwebtoken')
const REFRESH_TOKEN_SECRET = 'certify-jwt-secret-key'

module.exports = {
  generateAccessToken: (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET || REFRESH_TOKEN_SECRET, { expiresIn: '10h' })
  },
  authenticateToken: (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]
    if (token == null) return res.status(401).json({ message: 'Missing token' })

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) {
        console.log(err)
        return res.status(403).json({ message: 'Token expired' })
      }
      req.user = user
      next()
    })
  }
}
