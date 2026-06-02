/**
 * Authentication Controller
 * Handles admin login, logout, and auth validation
 */

import { getQuery } from '../utils/queryHelpers.js'
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js'
import { generateToken, revokeToken } from '../utils/tokenUtils.js'
import { sendSuccess, handleError } from '../utils/responseHelpers.js'

/**
 * Admin Login
 * POST /auth/login
 */
export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required',
      })
    }

    // Find admin user
    const admin = await getQuery(
      'SELECT id, username, password FROM admin_users WHERE username = ?',
      [username]
    )

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      })
    }

    // Verify password
    if (!verifyPassword(password, admin.password)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username or password',
      })
    }

    // Generate session token
    const { token, expiresAt } = generateToken(admin.id, admin.username)

    sendSuccess(
      res,
      {
        token,
        expiresAt,
        admin: {
          id: admin.id,
          username: admin.username,
        },
      },
      'Login successful',
      200
    )
  } catch (error) {
    handleError(res, error)
  }
}

/**
 * Admin Logout
 * POST /auth/logout
 */
export const logout = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (token) {
      revokeToken(token)
    }

    sendSuccess(res, {}, 'Logout successful')
  } catch (error) {
    handleError(res, error)
  }
}

/**
 * Verify Token / Get Current Admin
 * GET /auth/me
 */
export const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await getQuery(
      'SELECT id, username FROM admin_users WHERE id = ?',
      [req.admin.id]
    )

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      })
    }

    sendSuccess(res, admin, 'Admin retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

/**
 * Check if admin is authenticated
 * GET /auth/check
 */
export const checkAuth = async (req, res) => {
  try {
    sendSuccess(res, { authenticated: true, admin: req.admin }, 'Authenticated')
  } catch (error) {
    handleError(res, error)
  }
}
