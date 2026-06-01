import express from 'express'
import { getAllExams, getExamById, getExamQuestions, createExam, updateExam, deleteExam } from '../controllers/examController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllExams)
router.get('/:id/questions', getExamQuestions)
router.get('/:id', getExamById)
router.post('/', authMiddleware, createExam)
router.put('/:id', authMiddleware, updateExam)
router.delete('/:id', authMiddleware, deleteExam)

export default router
