/**
 * Exam Analytics Utilities
 * Functions for calculating scores, rankings, and reports
 */

import { allQuery, getQuery, runQuery } from './helpers.js'

/**
 * Calculate result and rank for a student's exam
 */
export const calculateExamResult = async (studentId, examId) => {
  try {
    // Get all answers for this student-exam combination
    const answers = await allQuery(
      `SELECT sa.*, q.section FROM student_answers sa
       JOIN questions q ON q.exam_id = sa.exam_id AND q.question_number = sa.question_number
       WHERE sa.student_id = ? AND sa.exam_id = ?
       ORDER BY q.section`,
      [studentId, examId]
    )

    // Calculate section scores
    let sectionAScore = 0
    let sectionBScore = 0
    let sectionCScore = 0
    let totalScore = 0

    answers.forEach(answer => {
      if (answer.is_correct) {
        switch (answer.section) {
          case 'A':
            sectionAScore++
            totalScore++
            break
          case 'B':
            sectionBScore++
            totalScore++
            break
          case 'C':
            sectionCScore++
            totalScore++
            break
        }
      }
    })

    // Calculate percentage
    const totalQuestions = 25 // 10 + 10 + 5
    const percentage = (totalScore / totalQuestions) * 100

    return {
      score: totalScore,
      percentage: parseFloat(percentage.toFixed(2)),
      sectionAScore,
      sectionBScore,
      sectionCScore,
    }
  } catch (error) {
    console.error('Error calculating exam result:', error)
    throw error
  }
}

/**
 * Calculate and save result with ranking
 */
export const saveExamResult = async (studentId, examId) => {
  try {
    // Calculate result
    const result = await calculateExamResult(studentId, examId)

    // Get all scores for this exam
    const allResults = await allQuery(
      `SELECT percentage FROM results WHERE exam_id = ? ORDER BY percentage DESC`,
      [examId]
    )

    // Calculate rank
    let rank = 1
    for (let i = 0; i < allResults.length; i++) {
      if (allResults[i].percentage > result.percentage) {
        rank++
      }
    }

    // Check if result exists
    const existingResult = await getQuery(
      'SELECT id FROM results WHERE student_id = ? AND exam_id = ?',
      [studentId, examId]
    )

    if (existingResult) {
      // Update existing result
      await runQuery(
        `UPDATE results SET 
         score = ?, percentage = ?, rank = ?, 
         section_a_score = ?, section_b_score = ?, section_c_score = ?
         WHERE student_id = ? AND exam_id = ?`,
        [
          result.score,
          result.percentage,
          rank,
          result.sectionAScore,
          result.sectionBScore,
          result.sectionCScore,
          studentId,
          examId,
        ]
      )
    } else {
      // Insert new result
      await runQuery(
        `INSERT INTO results 
         (student_id, exam_id, score, percentage, rank, section_a_score, section_b_score, section_c_score)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          studentId,
          examId,
          result.score,
          result.percentage,
          rank,
          result.sectionAScore,
          result.sectionBScore,
          result.sectionCScore,
        ]
      )
    }

    return {
      ...result,
      rank,
    }
  } catch (error) {
    console.error('Error saving exam result:', error)
    throw error
  }
}

/**
 * Get student's performance summary for an exam
 */
export const getStudentPerformance = async (studentId, examId) => {
  try {
    const result = await getQuery(
      `SELECT * FROM results WHERE student_id = ? AND exam_id = ?`,
      [studentId, examId]
    )

    if (!result) {
      return null
    }

    // Get exam info
    const exam = await getQuery(
      'SELECT exam_name, course, topic_name FROM exams WHERE id = ?',
      [examId]
    )

    // Get student info
    const student = await getQuery(
      'SELECT full_name, symbol_number, course FROM students WHERE id = ?',
      [studentId]
    )

    return {
      student,
      exam,
      result,
    }
  } catch (error) {
    console.error('Error getting student performance:', error)
    throw error
  }
}

/**
 * Get exam rankings (top performers)
 */
export const getExamRankings = async (examId, limit = 10) => {
  try {
    const rankings = await allQuery(
      `SELECT r.rank, r.percentage, r.score, s.full_name, s.symbol_number, s.batch
       FROM results r
       JOIN students s ON r.student_id = s.id
       WHERE r.exam_id = ?
       ORDER BY r.rank ASC
       LIMIT ?`,
      [examId, limit]
    )

    return rankings
  } catch (error) {
    console.error('Error getting exam rankings:', error)
    throw error
  }
}

/**
 * Get section-wise performance for class
 */
export const getClassSectionAnalysis = async (examId) => {
  try {
    const analysis = await getQuery(
      `SELECT 
         COUNT(*) as total_students,
         AVG(section_a_score) as avg_section_a,
         AVG(section_b_score) as avg_section_b,
         AVG(section_c_score) as avg_section_c,
         AVG(percentage) as avg_percentage,
         MAX(score) as highest_score,
         MIN(score) as lowest_score
       FROM results WHERE exam_id = ?`,
      [examId]
    )

    return {
      totalStudents: analysis.total_students,
      averageSectionA: parseFloat(analysis.avg_section_a?.toFixed(2) || 0),
      averageSectionB: parseFloat(analysis.avg_section_b?.toFixed(2) || 0),
      averageSectionC: parseFloat(analysis.avg_section_c?.toFixed(2) || 0),
      averagePercentage: parseFloat(analysis.avg_percentage?.toFixed(2) || 0),
      highestScore: analysis.highest_score,
      lowestScore: analysis.lowest_score,
    }
  } catch (error) {
    console.error('Error getting class section analysis:', error)
    throw error
  }
}

/**
 * Get student's weekly report
 */
export const getWeeklyReport = async (studentId, weekStart, weekEnd) => {
  try {
    const report = await getQuery(
      `SELECT * FROM weekly_reports 
       WHERE student_id = ? AND week_start = ? AND week_end = ?`,
      [studentId, weekStart, weekEnd]
    )

    return report
  } catch (error) {
    console.error('Error getting weekly report:', error)
    throw error
  }
}

/**
 * Save or update weekly report
 */
export const saveWeeklyReport = async (studentId, weekStart, weekEnd, aiFeedback, teacherRemark) => {
  try {
    const existingReport = await getQuery(
      `SELECT id FROM weekly_reports 
       WHERE student_id = ? AND week_start = ? AND week_end = ?`,
      [studentId, weekStart, weekEnd]
    )

    if (existingReport) {
      await runQuery(
        `UPDATE weekly_reports SET ai_feedback = ?, teacher_remark = ?
         WHERE student_id = ? AND week_start = ? AND week_end = ?`,
        [aiFeedback, teacherRemark, studentId, weekStart, weekEnd]
      )
    } else {
      await runQuery(
        `INSERT INTO weekly_reports (student_id, week_start, week_end, ai_feedback, teacher_remark)
         VALUES (?, ?, ?, ?, ?)`,
        [studentId, weekStart, weekEnd, aiFeedback, teacherRemark]
      )
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving weekly report:', error)
    throw error
  }
}
