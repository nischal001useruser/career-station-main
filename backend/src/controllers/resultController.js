import { allQuery, getQuery, runQuery } from '../utils/queryHelpers.js'
import { sendSuccess, handleError } from '../utils/responseHelpers.js'

const recalculateExamRanks = async (examId) => {
  // Normalize legacy/dirty attendance_status values before ranking (backward compatibility)
  await runQuery(`
    UPDATE results
    SET attendance_status = 'PRESENT'
    WHERE exam_id = ?
      AND (attendance_status IS NULL OR attendance_status = 'P' OR attendance_status = 'present' OR attendance_status = 'Present' OR attendance_status = 'PRESENT')
  `, [examId])

  await runQuery(`
    UPDATE results
    SET attendance_status = 'ABSENT'
    WHERE exam_id = ?
      AND (attendance_status = 'ABS' OR attendance_status = 'absent' OR attendance_status = 'Absent' OR attendance_status = 'ABSENT')
  `, [examId])

  const leaderboard = await allQuery(`
    SELECT r.id, r.score, r.percentage, s.full_name, s.symbol_number
    FROM results r
    JOIN students s ON s.id = r.student_id
    WHERE r.exam_id = ? AND r.attendance_status = 'PRESENT'
    ORDER BY r.score DESC, r.percentage DESC, s.full_name ASC, r.id ASC
  `, [examId])




  let currentRank = 0
  let previousScore = null
  let rankCounter = 0

  for (let index = 0; index < leaderboard.length; index++) {
    const row = leaderboard[index]
    rankCounter += 1

    if (previousScore === null || row.score !== previousScore) {
      currentRank = rankCounter
      previousScore = row.score
    }

    await runQuery('UPDATE results SET rank = ? WHERE id = ?', [currentRank, row.id])
  }

  return leaderboard
}

export const getAllResults = async (req, res) => {
  try {
    const results = await allQuery(`
      SELECT r.*, e.exam_name, e.course, e.nepali_date, s.full_name, s.symbol_number
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN students s ON r.student_id = s.id
      ORDER BY r.created_at DESC
    `)
    sendSuccess(res, results, 'Results retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getResultById = async (req, res) => {
  try {
    const { id } = req.params
    const result = await getQuery(`
      SELECT r.*, e.exam_name, e.course, e.nepali_date, s.full_name, s.symbol_number
      FROM results r
      JOIN exams e ON r.exam_id = e.id
      JOIN students s ON r.student_id = s.id
      WHERE r.id = ?
    `, [id])
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' })
    }
    sendSuccess(res, result, 'Result retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getLeaderboardByExam = async (req, res) => {
  try {
    const { examId } = req.params

    const leaderboard = await allQuery(`
      SELECT r.id, r.score, r.percentage, r.rank, r.section_a_score, r.section_b_score, r.section_c_score,
             s.id as student_id, s.full_name, s.symbol_number, s.course, s.batch
      FROM results r
      JOIN students s ON s.id = r.student_id
      WHERE r.exam_id = ? AND r.attendance_status = 'PRESENT'
      ORDER BY r.rank ASC, r.score DESC, r.percentage DESC, s.full_name ASC
    `, [examId])

    sendSuccess(res, leaderboard, 'Leaderboard retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

// Admin: fetch student performance buckets for a given exam.
// Buckets are computed on the frontend using: score + attendance_status.
// Endpoint returns results for ALL students that have a results row for the exam.
// Unmarked = results row exists but score is NULL.
// Absent = attendance_status === 'ABSENT'.
export const getExamResultsForAdmin = async (req, res) => {
  try {
    // Prefer examId; otherwise resolve from course + nepali_date
    const { examId } = req.params

    if (examId) {
      const rows = await allQuery(
        `
        SELECT
          s.id as student_id,
          s.full_name,
          s.symbol_number,
          s.course,
          s.batch,
          s.shift,
          r.id as result_id,
          r.exam_id,
          r.attendance_status,
          r.score,
          r.percentage,
          r.rank,
          e.exam_name,
          e.nepali_date,
          e.course as exam_course,
          e.shift as exam_shift
        FROM results r
        JOIN students s ON s.id = r.student_id
        JOIN exams e ON e.id = r.exam_id
        WHERE r.exam_id = ?
        ORDER BY s.full_name ASC, s.symbol_number ASC
        `,
        [examId]
      )

      const examInfo = rows[0]
        ? {
            exam_id: Number(rows[0].exam_id),
            exam_name: rows[0].exam_name,
            course: rows[0].exam_course,
            nepali_date: rows[0].nepali_date,
            shift: rows[0].exam_shift,
          }
        : null

      sendSuccess(res, { exam: examInfo, results: rows }, 'Exam results retrieved successfully')
      return
    }

    const { course, nepali_date: nepaliDate } = req.query
    if (!course || !nepaliDate) {
      return res.status(400).json({ success: false, message: 'course and nepali_date are required' })
    }

    const rows = await allQuery(
      `
      SELECT
        s.id as student_id,
        s.full_name,
        s.symbol_number,
        s.course,
        s.batch,
        s.shift,
        r.id as result_id,
        r.exam_id,
        r.attendance_status,
        r.score,
        r.percentage,
        r.rank,
        e.exam_name,
        e.nepali_date,
        e.course as exam_course,
        e.shift as exam_shift
      FROM results r
      JOIN students s ON s.id = r.student_id
      JOIN exams e ON e.id = r.exam_id
      WHERE e.course = ? AND e.nepali_date = ?
      ORDER BY e.id ASC, s.full_name ASC, s.symbol_number ASC
      `,
      [course, nepaliDate]
    )

    const examInfo = rows[0]
      ? {
          exam_id: Number(rows[0].exam_id),
          exam_name: rows[0].exam_name,
          course: rows[0].exam_course,
          nepali_date: rows[0].nepali_date,
          shift: rows[0].exam_shift,
        }
      : null

    sendSuccess(res, { exam: examInfo, results: rows }, 'Exam results retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}


export const getStudentResultBySymbolAndDate = async (req, res) => {
  try {
    const { symbol_number, exam_date } = req.query

    if (!symbol_number || !exam_date) {
      return res.status(400).json({ success: false, message: 'Symbol number and exam date are required' })
    }

    const result = await getQuery(`
      SELECT r.id, r.score, r.percentage, r.rank, r.section_a_score, r.section_b_score, r.section_c_score, r.attendance_status,
             s.id as student_id, s.full_name, s.symbol_number, s.course, s.batch,
             e.id as exam_id, e.exam_name, e.course as exam_course, e.topic_name, e.nepali_date, e.shift, e.total_questions
      FROM results r
      JOIN students s ON s.id = r.student_id
      JOIN exams e ON e.id = r.exam_id
      WHERE s.symbol_number = ? AND e.nepali_date = ?
    `, [symbol_number.trim(), exam_date.trim()])


    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found for the provided symbol number and exam date' })
    }

    const questionReviews = await allQuery(`
      SELECT sa.question_number,
             q.section,
             q.question_text,
             q.option_a,
             q.option_b,
             q.option_c,
             q.option_d,
             q.correct_option,
             sa.selected_option,
             sa.student_answer,
             sa.is_correct,
             CASE 
               WHEN sa.selected_option = 'NA' OR sa.selected_option IS NULL OR sa.student_answer IS NULL THEN 'Not Answered'
               WHEN sa.is_correct = 1 THEN 'Correct'
               ELSE 'Wrong'
             END as status
      FROM student_answers sa
      JOIN questions q
        ON q.exam_id = sa.exam_id
       AND q.question_number = sa.question_number
      WHERE sa.student_id = ? AND sa.exam_id = ?
      ORDER BY sa.question_number ASC
    `, [result.student_id, result.exam_id])



    sendSuccess(res, {
      student: {
        id: result.student_id,
        full_name: result.full_name,
        symbol_number: result.symbol_number,
        course: result.course,
        batch: result.batch,
      },
      exam: {
        id: result.exam_id,
        exam_name: result.exam_name,
        course: result.exam_course,
        topic_name: result.topic_name,
        nepali_date: result.nepali_date,
        shift: result.shift,
        total_questions: result.total_questions,
      },
      status: result.attendance_status,
      summary: {
        marks: result.score,
        percentage: Number(result.percentage),
        rank: result.rank,
        section_scores: {
          A: result.section_a_score,
          B: result.section_b_score,
          C: result.section_c_score,
        },
      },
      question_reviews: questionReviews.map((review) => ({
        question_number: review.question_number,
        question_text: review.question_text,
        option_a: review.option_a,
        option_b: review.option_b,
        option_c: review.option_c,
        option_d: review.option_d,
        correct_option: review.correct_option,
        selected_option: review.selected_option,
        status: review.status,
        section: review.section,
      })),
    }, 'Student result retrieved successfully')

  } catch (error) {
    handleError(res, error)
  }
}

export const getStudentResultDetails = async (req, res) => {
  try {
    const { studentId, examId } = req.params

    const result = await getQuery(`
      SELECT r.id, r.score, r.percentage, r.rank, r.section_a_score, r.section_b_score, r.section_c_score,
             s.id as student_id, s.full_name, s.symbol_number, s.course, s.batch,
             e.id as exam_id, e.exam_name, e.course as exam_course, e.topic_name, e.nepali_date, e.shift, e.total_questions
      FROM results r
      JOIN students s ON s.id = r.student_id
      JOIN exams e ON e.id = r.exam_id
      WHERE r.student_id = ? AND r.exam_id = ?
    `, [studentId, examId])

    if (!result) {
      return res.status(404).json({ success: false, message: 'Student result not found' })
    }

    const questionReviews = await allQuery(`
      SELECT sa.question_number,
             q.section,
             q.question_text,
             q.option_a,
             q.option_b,
             q.option_c,
             q.option_d,
             q.correct_option,
             sa.selected_option,
             sa.student_answer,
             sa.is_correct,
             CASE 
               WHEN sa.selected_option = 'NA' OR sa.selected_option IS NULL OR sa.student_answer IS NULL THEN 'Not Answered'
               WHEN sa.is_correct = 1 THEN 'Correct'
               ELSE 'Wrong'
             END as status
      FROM student_answers sa
      JOIN questions q
        ON q.exam_id = sa.exam_id
       AND q.question_number = sa.question_number
      WHERE sa.student_id = ? AND sa.exam_id = ?
      ORDER BY sa.question_number ASC
    `, [studentId, examId])


    sendSuccess(res, {
      student: {
        id: result.student_id,
        full_name: result.full_name,
        symbol_number: result.symbol_number,
        course: result.course,
        batch: result.batch,
      },
      exam: {
        id: result.exam_id,
        exam_name: result.exam_name,
        course: result.exam_course,
        topic_name: result.topic_name,
        nepali_date: result.nepali_date,
        shift: result.shift,
        total_questions: result.total_questions,
      },
      status: result.attendance_status,
      summary: {
        marks: result.score,
        percentage: Number(result.percentage),
        rank: result.rank,
        section_scores: {
          A: result.section_a_score,
          B: result.section_b_score,
          C: result.section_c_score,
        },
      },
      question_reviews: questionReviews.map((review) => ({
        question_number: review.question_number,
        question_text: review.question_text,
        option_a: review.option_a,
        option_b: review.option_b,
        option_c: review.option_c,
        option_d: review.option_d,
        correct_option: review.correct_option,
        selected_option: review.selected_option,
        status: review.status,
        section: review.section,
      })),
    }, 'Student result details retrieved successfully')

  } catch (error) {
    handleError(res, error)
  }
}

export const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params

    const student = await getQuery('SELECT * FROM students WHERE id = ?', [studentId])
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    const topicPerformance = await allQuery(`
      SELECT e.topic_name as topic,
             AVG(r.percentage) as avg_percentage,
             COUNT(*) as attempts
      FROM results r
      JOIN exams e ON e.id = r.exam_id
      WHERE r.student_id = ?
      GROUP BY e.topic_name
      ORDER BY avg_percentage DESC, attempts DESC
    `, [studentId])

    const weeklyAverage = await allQuery(`
      SELECT strftime('%Y-W%W', e.nepali_date) as week_key,
             MIN(e.nepali_date) as week_start,
             AVG(r.percentage) as avg_percentage
      FROM results r
      JOIN exams e ON e.id = r.exam_id
      WHERE r.student_id = ?
      GROUP BY week_key
      ORDER BY week_start ASC
    `, [studentId])

    const examHistory = await allQuery(`
      SELECT e.id as exam_id,
             e.exam_name,
             e.topic_name,
             e.nepali_date,
             r.score,
             r.percentage,
             r.rank,
             r.section_a_score,
             r.section_b_score,
             r.section_c_score
      FROM results r
      JOIN exams e ON e.id = r.exam_id
      WHERE r.student_id = ?
      ORDER BY e.nepali_date ASC, e.id ASC
    `, [studentId])

    const repeatedMistakes = await allQuery(`
      SELECT q.question_number,
             q.section,
             q.correct_option,
             SUM(CASE WHEN sa.is_correct = 0 THEN 1 ELSE 0 END) as wrong_attempts,
             GROUP_CONCAT(DISTINCT sa.selected_option) as wrong_options
      FROM student_answers sa
      JOIN questions q
        ON q.exam_id = sa.exam_id
       AND q.question_number = sa.question_number
      WHERE sa.student_id = ?
      GROUP BY q.question_number, q.section, q.correct_option
      HAVING wrong_attempts > 1
      ORDER BY wrong_attempts DESC, q.question_number ASC
      LIMIT 10
    `, [studentId])

    if (repeatedMistakes.length === 0) {
      const fallbackRepeatedMistakes = await allQuery(`
        SELECT q.question_number,
               q.section,
               q.correct_option,
               SUM(CASE WHEN sa.is_correct = 0 THEN 1 ELSE 0 END) as wrong_attempts,
               GROUP_CONCAT(DISTINCT sa.selected_option) as wrong_options
        FROM student_answers sa
        JOIN questions q
          ON q.exam_id = sa.exam_id
         AND q.question_number = sa.question_number
        WHERE sa.student_id = ?
        GROUP BY q.question_number, q.section, q.correct_option
        ORDER BY wrong_attempts DESC, q.question_number ASC
        LIMIT 10
      `, [studentId])

      repeatedMistakes.push(...fallbackRepeatedMistakes)
    }

    const sectionPerformance = await getQuery(`
      SELECT AVG(r.section_a_score) as avg_section_a,
             AVG(r.section_b_score) as avg_section_b,
             AVG(r.section_c_score) as avg_section_c,
             AVG(r.percentage) as overall_average
      FROM results r
      WHERE r.student_id = ?
    `, [studentId])

    const strongestTopic = topicPerformance[0] || null
    const weakestTopic = topicPerformance[topicPerformance.length - 1] || null
    const overallAverage = Number(sectionPerformance?.overall_average || 0)

    const classTopics = await allQuery(`
      SELECT e.topic_name as topic,
             AVG(r.percentage) as avg_percentage
      FROM results r
      JOIN exams e ON e.id = r.exam_id
      GROUP BY e.topic_name
      ORDER BY avg_percentage DESC
    `)

    const classStats = await getQuery(`
      SELECT AVG(r.percentage) as class_average,
             MAX(r.score) as topper_marks,
             MIN(r.score) as lowest_marks
      FROM results r
    `)

    const hardestTopic = classTopics[classTopics.length - 1] || null
    const classStrongestTopic = classTopics[0] || null

    sendSuccess(res, {
      student: {
        id: student.id,
        full_name: student.full_name,
        symbol_number: student.symbol_number,
        course: student.course,
        shift: student.shift,
        batch: student.batch,
      },
      student_analytics: {
        topic_performance: topicPerformance.map((row) => ({
          topic: row.topic,
          avg_percentage: Number(Number(row.avg_percentage).toFixed(2)),
          attempts: row.attempts,
        })),
        weekly_average: weeklyAverage.map((row) => ({
          week_key: row.week_key,
          week_start: row.week_start,
          avg_percentage: Number(Number(row.avg_percentage).toFixed(2)),
        })),
        exam_history: examHistory.map((row) => ({
          exam_id: row.exam_id,
          exam_name: row.exam_name,
          topic_name: row.topic_name,
          nepali_date: row.nepali_date,
          score: row.score,
          percentage: Number(Number(row.percentage).toFixed(2)),
          rank: row.rank,
        })),
        repeated_mistakes: repeatedMistakes.map((row) => ({
          question_number: row.question_number,
          section: row.section,
          correct_option: row.correct_option,
          wrong_attempts: Number(row.wrong_attempts),
          wrong_options: (row.wrong_options || '').split(',').filter(Boolean),
        })),
        strongest_topic: strongestTopic ? {
          topic: strongestTopic.topic,
          avg_percentage: Number(Number(strongestTopic.avg_percentage).toFixed(2)),
        } : null,
        weakest_topic: weakestTopic ? {
          topic: weakestTopic.topic,
          avg_percentage: Number(Number(weakestTopic.avg_percentage).toFixed(2)),
        } : null,
        section_performance: {
          A: Number((Number(sectionPerformance?.avg_section_a || 0) / 10 * 100).toFixed(2)),
          B: Number((Number(sectionPerformance?.avg_section_b || 0) / 10 * 100).toFixed(2)),
          C: Number((Number(sectionPerformance?.avg_section_c || 0) / 5 * 100).toFixed(2)),
        },
        overall_average: Number(overallAverage.toFixed(2)),
      },
      class_insights: {
        class_average: Number(Number(classStats?.class_average || 0).toFixed(2)),
        topper_marks: Number(classStats?.topper_marks || 0),
        lowest_marks: Number(classStats?.lowest_marks || 0),
        strongest_topic: classStrongestTopic ? {
          topic: classStrongestTopic.topic,
          avg_percentage: Number(Number(classStrongestTopic.avg_percentage).toFixed(2)),
        } : null,
        hardest_topic: hardestTopic ? {
          topic: hardestTopic.topic,
          avg_percentage: Number(Number(hardestTopic.avg_percentage).toFixed(2)),
        } : null,
      },
    }, 'Student analytics retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const generateExamRanks = async (req, res) => {
  try {
    const { examId } = req.params

    const exam = await getQuery('SELECT id FROM exams WHERE id = ?', [examId])
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    await recalculateExamRanks(examId)

    const updatedLeaderboard = await allQuery(`
      SELECT r.id, r.score, r.percentage, r.rank, s.full_name, s.symbol_number, s.course, s.batch
      FROM results r
      JOIN students s ON s.id = r.student_id
      WHERE r.exam_id = ? AND r.attendance_status = 'PRESENT'
      ORDER BY r.rank ASC, r.score DESC, r.percentage DESC, s.full_name ASC
    `, [examId])


    sendSuccess(
      res,
      {
        exam_id: Number(examId),
        updated_count: updatedLeaderboard.length,
        leaderboard: updatedLeaderboard,
      },
      'Ranks generated successfully'
    )
  } catch (error) {
    handleError(res, error)
  }
}

export const createResult = async (req, res) => {
  try {
    const { exam_id, student_id, answers = [], attendance_status } = req.body

    if (!exam_id || !student_id) {
      return res.status(400).json({ success: false, message: 'Exam and student are required' })
    }

    const exam = await getQuery('SELECT id, total_questions FROM exams WHERE id = ?', [exam_id])
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' })
    }

    const student = await getQuery('SELECT id FROM students WHERE id = ?', [student_id])
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    // Normalize attendance_status (backward compatible)
    const normalizedAttendance = (() => {
      if (!attendance_status) return 'PRESENT'
      const v = String(attendance_status).trim().toLowerCase()
      if (v === 'absent') return 'ABSENT'
      return 'PRESENT'
    })()

    const isAbsent = normalizedAttendance === 'ABSENT'


    if (!isAbsent) {
      // PRESENT: admin must provide answer rows for every question (can be null/NA for unanswered).
      if (!Array.isArray(answers) || answers.length !== exam.total_questions) {
        return res.status(400).json({
          success: false,
          message: `Exactly ${exam.total_questions} answers are required (unanswered allowed as null/NA)`
        })
      }
    }

    const existingResult = await getQuery('SELECT * FROM results WHERE student_id = ? AND exam_id = ?', [student_id, exam_id])
    const existed = !!existingResult

    const questionRows = await allQuery(
      'SELECT question_number, section, correct_option FROM questions WHERE exam_id = ? ORDER BY question_number',
      [exam_id]
    )

    if (questionRows.length !== exam.total_questions) {
      return res.status(400).json({ success: false, message: 'Exam answer key is incomplete' })
    }

    const answerMap = new Map(questionRows.map((q) => [q.question_number, q]))

    // DELETE existing per-question answers then re-insert all rows for this student/exam.
    await runQuery('DELETE FROM student_answers WHERE student_id = ? AND exam_id = ?', [student_id, exam_id])

    const studentAnswers = []
    let totalCorrect = 0
    let sectionAScore = 0
    let sectionBScore = 0
    let sectionCScore = 0

    if (isAbsent) {
      // ABSENT: all questions treated as skipped/unanswered.
      for (const q of questionRows) {
        studentAnswers.push({
          student_id,
          exam_id,
          question_number: q.question_number,
          selected_option: null,
          student_answer: null,
          is_correct: 0,
        })
      }
    } else {
      // PRESENT: validate answers safely.
      for (const answer of answers) {
        const { question_number, selected_option } = answer || {}
        const q = answerMap.get(Number(question_number))


        if (!q) {
          return res.status(400).json({ success: false, message: `Invalid question number: ${question_number}` })
        }

        // unanswered: allow null/undefined/''/'NA'
        const isUnanswered = selected_option === null || selected_option === undefined || selected_option === '' || selected_option === 'NA'

        if (isUnanswered) {
          studentAnswers.push({
            student_id,
            exam_id,
            question_number: Number(question_number),
            selected_option: null,
            student_answer: null,
            is_correct: 0,
          })
          continue
        }

        if (!['A', 'B', 'C', 'D'].includes(selected_option)) {
          return res.status(400).json({ success: false, message: `Invalid selected option for question ${question_number}` })
        }

        const isCorrect = selected_option === q.correct_option
        if (isCorrect) {
          totalCorrect += 1
          if (q.section === 'A') sectionAScore += 1
          if (q.section === 'B') sectionBScore += 1
          if (q.section === 'C') sectionCScore += 1
        }

        studentAnswers.push({
          student_id,
          exam_id,
          question_number: Number(question_number),
          selected_option,
          student_answer: selected_option,
          is_correct: isCorrect ? 1 : 0,
        })
      }
    }

    for (const a of studentAnswers) {
      await runQuery(
        'INSERT INTO student_answers (student_id, exam_id, question_number, selected_option, student_answer, is_correct) VALUES (?, ?, ?, ?, ?, ?)',
        [a.student_id, a.exam_id, a.question_number, a.selected_option ?? null, a.student_answer ?? null, a.is_correct]
      )
    }

    const score = isAbsent ? 0 : totalCorrect
    const section_a_score = isAbsent ? 0 : sectionAScore
    const section_b_score = isAbsent ? 0 : sectionBScore
    const section_c_score = isAbsent ? 0 : sectionCScore
    const percentage = isAbsent ? 0 : Number(((totalCorrect / exam.total_questions) * 100).toFixed(2))

    const updater = req.admin?.username || 'admin'
    const attendanceValue = isAbsent ? 'ABSENT' : 'PRESENT'

    if (existed) {
      await runQuery(
        'UPDATE results SET score = ?, percentage = ?, attendance_status = ?, section_a_score = ?, section_b_score = ?, section_c_score = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE student_id = ? AND exam_id = ?',
        [score, percentage, attendanceValue, section_a_score, section_b_score, section_c_score, updater, student_id, exam_id]
      )
    } else {
      await runQuery(
        'INSERT INTO results (student_id, exam_id, score, percentage, attendance_status, section_a_score, section_b_score, section_c_score, updated_at, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, ?)',
        [student_id, exam_id, score, percentage, attendanceValue, section_a_score, section_b_score, section_c_score, updater]
      )
    }

    if (!isAbsent) {
      await recalculateExamRanks(exam_id)
    }

    const savedResult = await getQuery('SELECT id, rank FROM results WHERE student_id = ? AND exam_id = ?', [student_id, exam_id])

    sendSuccess(
      res,
      {
        id: savedResult?.id ?? null,
        student_id,
        exam_id,
        existed,
        score,
        percentage,
        rank: isAbsent ? 'ABS' : savedResult?.rank ?? null,
        attendance_status: attendanceValue,
        section_a_score,
        section_b_score,
        section_c_score,
      },
      existed ? 'Result updated successfully' : 'Result created successfully',
      existed ? 200 : 201
    )
  } catch (error) {
    handleError(res, error)
  }
}



// NOTE: updateResult (PUT /api/results/:id) is kept for backward compatibility.
// The main upsert workflow is implemented in createResult (POST /api/results).
export const updateResult = async (req, res) => {
  try {
    const { id } = req.params
    const { score, percentage, section_a_score, section_b_score, section_c_score } = req.body

    const existingResult = await getQuery('SELECT * FROM results WHERE id = ?', [id])
    if (!existingResult) {
      return res.status(404).json({ success: false, message: 'Result not found' })
    }

    const updater = req.admin?.username || 'admin'

    await runQuery(
      'UPDATE results SET score = ?, percentage = ?, section_a_score = ?, section_b_score = ?, section_c_score = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?',
      [
        score ?? existingResult.score,
        percentage ?? existingResult.percentage,
        section_a_score ?? existingResult.section_a_score,
        section_b_score ?? existingResult.section_b_score,
        section_c_score ?? existingResult.section_c_score,
        updater,
        id,
      ]
    )

    await recalculateExamRanks(existingResult.exam_id)

    sendSuccess(res, { id }, 'Result updated successfully')
  } catch (error) {
    handleError(res, error)
  }
}


export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params
    const result = await getQuery('SELECT * FROM results WHERE id = ?', [id])
    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' })
    }

    await runQuery('DELETE FROM results WHERE id = ?', [id])
    sendSuccess(res, { id }, 'Result deleted successfully')
  } catch (error) {
    handleError(res, error)
  }
}

// Returns list of students who already have a result for the given exam.
// Used by InputResultPage to show Completed vs Pending and prevent duplicates.
export const getExamResultsStatusByStudents = async (req, res) => {
  try {
    const { examId } = req.params

    const totalStudentsRows = await allQuery('SELECT id FROM students')
    const totalStudents = totalStudentsRows.length

    const completedRows = await allQuery(
      'SELECT DISTINCT student_id FROM results WHERE exam_id = ?',
      [examId]
    )

    const completedStudentIds = completedRows.map((r) => Number(r.student_id))
    const completedCount = completedStudentIds.length
    const pendingCount = Math.max(0, totalStudents - completedCount)

    sendSuccess(res, {
      completedStudentIds,
      totalStudents,
      completedCount,
      pendingCount,
    }, 'Exam results status retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

