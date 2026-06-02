import express from 'express'
import {
  submitReviewRequest,
  getAllReviewRequests,
  updateReviewRequestStatus,
  deleteReviewRequest, // 1. Add your delete controller import here
} from '../controllers/reviewController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', submitReviewRequest)
router.get('/', authMiddleware, getAllReviewRequests)
router.patch('/:id/status', authMiddleware, updateReviewRequestStatus)

// 2. Add the DELETE route handler here
router.delete('/:id', authMiddleware, deleteReviewRequest) 

export default router