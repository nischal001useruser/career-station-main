import express from 'express'
import { authMiddleware } from '../middleware/authMiddleware.js'
import { getExamResultsStatusByStudents } from '../controllers/resultController.js'

const router = express.Router()

// Returns per-student completion status for a given exam.
// Response: { success: true, data: { completedStudentIds: number[], totalStudents: number, completedCount: number, pendingCount: number } }
router.get('/exam/:examId/students/status', authMiddleware, getExamResultsStatusByStudents)

export default router

