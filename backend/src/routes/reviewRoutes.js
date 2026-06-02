import express from 'express'

import {
  submitReviewRequest,
  deleteReviewRequest,
  getAllReviewRequests,
} from '../controllers/reviewController.js'

export const reviewRoutes = express.Router()

reviewRoutes.post('/submit', submitReviewRequest)
reviewRoutes.delete('/:id', deleteReviewRequest)
reviewRoutes.get('/', getAllReviewRequests)

