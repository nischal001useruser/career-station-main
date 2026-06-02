import express from 'express'
import { getAllResults, getResultById, getLeaderboardByExam, getStudentResultBySymbolAndDate, getStudentResultDetails, getStudentAnalytics, generateExamRanks, createResult, updateResult, deleteResult } from '../controllers/resultController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllResults)
router.get('/public', getStudentResultBySymbolAndDate)
router.get('/leaderboard/:examId', getLeaderboardByExam)
router.get('/analytics/student/:studentId', getStudentAnalytics)
router.get('/student/:studentId/exam/:examId', getStudentResultDetails)
router.get('/:id', getResultById)
router.post('/', authMiddleware, createResult)
router.post('/generate-ranks/:examId', authMiddleware, generateExamRanks)
router.put('/:id', authMiddleware, updateResult)
router.delete('/:id', authMiddleware, deleteResult)

export default router
