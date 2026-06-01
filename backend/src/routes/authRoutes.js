/**
 * Authentication Routes
 */

import express from 'express'
import { login, logout, getCurrentAdmin, checkAuth } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/login', login)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, getCurrentAdmin)
router.get('/check', authMiddleware, checkAuth)

export default router
