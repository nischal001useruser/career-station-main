/**
 * Authentication Middleware
 * Validates admin token from request
 */

import { verifyToken } from '../utils/tokenUtils.js'

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No authorization token provided',
    })
  }

  const tokenData = verifyToken(token)

  if (!tokenData) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    })
  }

  // Attach admin info to request
  req.admin = {
    id: tokenData.adminId,
    username: tokenData.username,
  }

  next()
}

/**
 * Optional auth middleware - sets req.admin but doesn't fail
 */
export const optionalAuthMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (token) {
    const tokenData = verifyToken(token)
    if (tokenData) {
      req.admin = {
        id: tokenData.adminId,
        username: tokenData.username,
      }
    }
  }

  next()
}
