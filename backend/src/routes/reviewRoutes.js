import express from 'express'
import {
  submitReviewRequest,
  getAllReviewRequests,
  updateReviewRequestStatus,
} from '../controllers/reviewController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/', submitReviewRequest)
router.get('/', authMiddleware, getAllReviewRequests)
router.patch('/:id/status', authMiddleware, updateReviewRequestStatus)

export default router