import { allQuery, getQuery, runQuery } from '../utils/queryHelpers.js'
import { sendSuccess, handleError } from '../utils/responseHelpers.js'

const normalizeQuestionNumbers = (questionNumbers) => {
  const raw = String(questionNumbers || '')
    .split(/[,\s;]+/)
    .map((item) => Number(item.trim()))
    .filter((num) => Number.isInteger(num) && num > 0)

  return Array.from(new Set(raw)).sort((a, b) => a - b)
}

const formatQuestionNumbers = (numbers) => numbers.join(', ')

export const submitReviewRequest = async (req, res) => {
  try {
    const { symbol_number, exam_date, question_numbers, reason } = req.body

    if (!symbol_number || !exam_date || !question_numbers || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Symbol number, exam date, question numbers, and reason are required',
      })
    }

    const normalizedQuestionNumbers = normalizeQuestionNumbers(question_numbers)
    if (normalizedQuestionNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Provide at least one valid question number for review',
      })
    }

    const wordCount = String(reason).trim().split(/\s+/).filter(Boolean).length
    if (wordCount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Please explain your concern in at least 100 words so instructors can properly review your request.',
      })
    }

    const student = await getQuery(
      'SELECT id FROM students WHERE symbol_number = ?',
      [symbol_number.trim()]
    )

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    const exam = await getQuery(
      'SELECT id FROM exams WHERE nepali_date = ?',
      [exam_date.trim()]
    )

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    const existingRequests = await allQuery(
      'SELECT question_number FROM review_requests WHERE student_id = ? AND exam_id = ?',
      [student.id, exam.id]
    )

    const existingQuestionSet = new Set(
      existingRequests.flatMap((row) => normalizeQuestionNumbers(row.question_number))
    )
    const overlappingQuestions = normalizedQuestionNumbers.filter((num) => existingQuestionSet.has(num))

    if (overlappingQuestions.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Review request already submitted for this question${overlappingQuestions.length > 1 ? 's' : ''}: ${formatQuestionNumbers(overlappingQuestions)}.`,
      })
    }

    const questionNumbersValue = formatQuestionNumbers(normalizedQuestionNumbers)

    const result = await runQuery(
      `INSERT INTO review_requests (student_id, exam_id, question_number, reason, status)
       VALUES (?, ?, ?, ?, ?)`,
      [student.id, exam.id, questionNumbersValue, reason.trim(), 'ToBeReviewed']
    )

    sendSuccess(
      res,
      {
        id: result.lastID,
        student_id: student.id,
        exam_id: exam.id,
        question_number: questionNumbersValue,
        reason: reason.trim(),
        status: 'ToBeReviewed',
      },
      'Review request submitted successfully',
      201
    )
  } catch (error) {
    handleError(res, error)
  }
}

export const getAllReviewRequests = async (req, res) => {
  try {
    const requests = await allQuery(`
      SELECT rr.id,
             rr.student_id,
             rr.exam_id,
             rr.question_number,
             rr.reason,
             rr.status,
             rr.created_at,
             s.full_name,
             s.symbol_number,
             e.exam_name,
             e.topic_name,
             e.nepali_date
      FROM review_requests rr
      JOIN students s ON s.id = rr.student_id
      JOIN exams e ON e.id = rr.exam_id
      ORDER BY rr.created_at DESC
    `)

    const requestDetails = await Promise.all(
      requests.map(async (request) => {
        const questionNumbers = normalizeQuestionNumbers(request.question_number)
        let questions = []

        if (questionNumbers.length > 0) {
          const placeholders = questionNumbers.map(() => '?').join(', ')
          questions = await allQuery(
            `SELECT question_number, question_text, option_a, option_b, option_c, option_d, correct_option
             FROM questions
             WHERE exam_id = ? AND question_number IN (${placeholders})
             ORDER BY question_number`,
            [request.exam_id, ...questionNumbers]
          )
        }

        return {
          ...request,
          questions,
          question_numbers: questionNumbers,
        }
      })
    )

    sendSuccess(res, requestDetails, 'Review requests retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const updateReviewRequestStatus = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    const allowedStatuses = ['ToBeReviewed', 'Solved', 'False Report']

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${allowedStatuses.join(', ')}`,
      })
    }

    const existing = await getQuery('SELECT id FROM review_requests WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review request not found' })
    }

    const current = await getQuery('SELECT status FROM review_requests WHERE id = ?', [id])
    if (!current) {
      return res.status(404).json({ success: false, message: 'Review request not found' })
    }

    // Allowed transitions:
    // - ToBeReviewed -> Solved / False Report / ToBeReviewed
    // - Solved -> ToBeReviewed (re-open)
    // - False Report -> ToBeReviewed (re-open)
    // Disallow direct Solved <-> False Report changes; use ToBeReviewed as the re-open step.
    const allowedTransitions = {
      ToBeReviewed: new Set(['ToBeReviewed', 'Solved', 'False Report']),
      Solved: new Set(['Solved', 'ToBeReviewed']),
      'False Report': new Set(['False Report', 'ToBeReviewed']),
    }


    const currentStatus = current.status
    const allowedNext = allowedTransitions[currentStatus]

    if (!allowedNext || !allowedNext.has(status)) {
      return res.status(409).json({
        success: false,
        message: `Status cannot be changed from ${currentStatus} to ${status}.`,
      })
    }

    await runQuery('UPDATE review_requests SET status = ? WHERE id = ?', [status, id])



    sendSuccess(res, { id: Number(id), status }, 'Review request status updated successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const deleteReviewRequest = async (req, res) => {
  try {
    const { id } = req.params
    const existing = await getQuery('SELECT id FROM review_requests WHERE id = ?', [id])
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Review request not found' })
    }

    await runQuery('DELETE FROM review_requests WHERE id = ?', [id])
    sendSuccess(res, { id: Number(id) }, 'Review request deleted successfully')
  } catch (error) {
    handleError(res, error)
  }
}
