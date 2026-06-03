import express from 'express'
import { getAllResults, getResultById, getLeaderboardByExam, getStudentResultBySymbolAndDate, getStudentResultDetails, getStudentAnalytics, getExamResultsForAdmin, generateExamRanks, createResult, updateResult, deleteResult } from '../controllers/resultController.js'


import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllResults)
router.get('/public', getStudentResultBySymbolAndDate)
router.get('/leaderboard/:examId', getLeaderboardByExam)
// Admin: ranked/unmarked/absent buckets for a selected exam.
router.get('/admin/exam-results/:examId', authMiddleware, getExamResultsForAdmin)
router.get('/admin/exam-results', authMiddleware, getExamResultsForAdmin)
router.get('/analytics/student/:studentId', getStudentAnalytics)
router.get('/student/:studentId/exam/:examId', getStudentResultDetails)
router.get('/:id', getResultById)

router.post('/', authMiddleware, createResult)
router.post('/generate-ranks/:examId', authMiddleware, generateExamRanks)
router.put('/:id', authMiddleware, updateResult)
router.delete('/:id', authMiddleware, deleteResult)

export default router
