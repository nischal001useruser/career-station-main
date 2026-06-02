/**
 * JWT/Session Token Utility
 * Simple token generation and validation
 */

import crypto from 'crypto'

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'career-station-secret-key-2024'
const TOKEN_EXPIRY_HOURS = Number(process.env.TOKEN_EXPIRE_HOURS) || 24
const TOKENS = new Map() // In-memory token store (use Redis in production)

/**
 * Generate session token for admin
 */
export const generateToken = (adminId, username) => {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000)

  TOKENS.set(token, {
    adminId,
    username,
    expiresAt,
    createdAt: new Date(),
    secret: TOKEN_SECRET,
  })

  return { token, expiresAt }
}

/**
 * Verify and get token data
 */
export const verifyToken = (token) => {
  const tokenData = TOKENS.get(token)

  if (!tokenData) {
    return null
  }

  // Check if token expired
  if (new Date() > tokenData.expiresAt) {
    TOKENS.delete(token)
    return null
  }

  return tokenData
}

/**
 * Revoke token (logout)
 */
export const revokeToken = (token) => {
  TOKENS.delete(token)
}

/**
 * Get all active tokens (for development/admin panel)
 */
export const getActiveTokens = () => {
  const now = new Date()
  const activeTokens = []

  for (const [token, data] of TOKENS.entries()) {
    if (now < data.expiresAt) {
      activeTokens.push({
        username: data.username,
        createdAt: data.createdAt,
        expiresAt: data.expiresAt,
      })
    } else {
      TOKENS.delete(token)
    }
  }

  return activeTokens
}
