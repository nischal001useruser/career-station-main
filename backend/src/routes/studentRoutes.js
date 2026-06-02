import express from 'express'
import { getAllStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/studentController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getAllStudents)
router.get('/:id', getStudentById)
router.post('/', authMiddleware, createStudent)
router.put('/:id', authMiddleware, updateStudent)
router.delete('/:id', authMiddleware, deleteStudent)

export default router
