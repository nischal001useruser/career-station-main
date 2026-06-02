import { sendSuccess, handleError } from '../utils/responseHelpers.js'
// Add this (imports the functions that manage your db)
import { getDatabase } from '../database/connection.js'
export const submitReviewRequest = async (req, res) => {
  try {
    const { symbol_number, exam_date, question_numbers, reason } = req.body

    const result = await db.run(
      `INSERT INTO review_requests (symbol_number, exam_date, question_numbers, reason, status, created_at)
       VALUES (?, ?, ?, ?, 'ToBeReviewed', CURRENT_TIMESTAMP)`,
      [
        symbol_number,
        exam_date,
        JSON.stringify(question_numbers || []),
        reason || '',
      ]
    )

    return sendSuccess(res, { id: result?.lastID }, 'Review request submitted successfully', 201)
  } catch (error) {
    return handleError(res, error)
  }
}

export const deleteReviewRequest = async (req, res) => {
  try {
    const { id } = req.params

    await db.run(`DELETE FROM review_requests WHERE id = ?`, [id])

    return sendSuccess(res, { id }, 'Review request deleted successfully', 200)
  } catch (error) {
    return handleError(res, error)
  }
}

export const getAllReviewRequests = async (_req, res) => {
  try {
    const rows = await db.all(`SELECT * FROM review_requests ORDER BY created_at DESC`)

    const data = (rows || []).map((r) => {
      let question_numbers = r.question_numbers
      if (typeof question_numbers === 'string') {
        try {
          question_numbers = JSON.parse(question_numbers)
        } catch {
          question_numbers = []
        }
      }

      return {
        ...r,
        question_numbers,
      }
    })

    return sendSuccess(res, data, 'Review requests fetched successfully', 200)
  } catch (error) {
    return handleError(res, error)
  }
}

