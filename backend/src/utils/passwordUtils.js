/**
 * Password Utility Functions
 * Hashing and verification for admin authentication
 */

import crypto from 'crypto'

/**
 * Hash password using SHA256
 */
export const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Verify password against hash
 */
export const verifyPassword = (password, hash) => {
  const hashedPassword = hashPassword(password)
  return hashedPassword === hash
}
