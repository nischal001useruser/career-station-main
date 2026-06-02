import { allQuery, getQuery, runQuery } from '../utils/queryHelpers.js'
import { sendSuccess, handleError } from '../utils/responseHelpers.js'

// Global scoring calculation: completely section-agnostic
const recalculateExamResults = async (examId) => {
  const questions = await allQuery('SELECT question_number, correct_option FROM questions WHERE exam_id = ?', [examId]);
  if (questions.length === 0) return;

  const totalQuestions = questions.length;
  const questionMap = new Map(questions.map((q) => [q.question_number, q]));

  const studentAnswers = await allQuery('SELECT id, student_id, question_number, selected_option FROM student_answers WHERE exam_id = ?', [examId]);

  // Update correctness status for all student answers
  for (const answer of studentAnswers) {
    const q = questionMap.get(answer.question_number);
    const isCorrect = q && answer.selected_option === q.correct_option ? 1 : 0;
    await runQuery('UPDATE student_answers SET is_correct = ? WHERE id = ?', [isCorrect, answer.id]);
  }

  // Aggregate global scores
  const aggregates = await allQuery(
    'SELECT student_id, SUM(is_correct) as raw_score FROM student_answers WHERE exam_id = ? GROUP BY student_id',
    [examId]
  );

  for (const s of aggregates) {
    const percentage = Number(((s.raw_score / totalQuestions) * 100).toFixed(2));
    await runQuery('UPDATE results SET score = ?, percentage = ? WHERE exam_id = ? AND student_id = ?', 
      [s.raw_score, percentage, examId, s.student_id]);
  }

  // Rank purely by global score
  const leaderboard = await allQuery('SELECT id, score FROM results WHERE exam_id = ? ORDER BY score DESC, id ASC', [examId]);
  for (let i = 0; i < leaderboard.length; i++) {
    await runQuery('UPDATE results SET rank = ? WHERE id = ?', [i + 1, leaderboard[i].id]);
  }
};

export const createExam = async (req, res) => {
  try {
    const { exam_name, course, topic_name, nepali_date, shift, questions = [] } = req.body;
    
    if (!course || !topic_name || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing required fields or questions' });
    }

    const examResult = await runQuery(
      'INSERT INTO exams (exam_name, course, topic_name, nepali_date, shift, total_questions) VALUES (?, ?, ?, ?, ?, ?)',
      [exam_name || `${course} - ${topic_name}`, course, topic_name, nepali_date, shift, questions.length]
    );

    const examId = examResult.lastID;
    for (const q of questions) {
      await runQuery(
        'INSERT INTO questions (exam_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [examId, q.question_number, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option]
      );
    }
    sendSuccess(res, { examId }, 'Exam created successfully', 201);
  } catch (error) { handleError(res, error); }
};

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions, ...examData } = req.body;

    if (questions) {
      await runQuery('DELETE FROM questions WHERE exam_id = ?', [id]);
      for (const q of questions) {
        await runQuery('INSERT INTO questions (exam_id, question_number, question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [id, q.question_number, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_option]);
      }
      await runQuery('UPDATE exams SET total_questions = ? WHERE id = ?', [questions.length, id]);
      await recalculateExamResults(Number(id));
    }
    sendSuccess(res, { id }, 'Exam updated successfully');
  } catch (error) { handleError(res, error); }
};
// Keep getAllExams, getExamById, and deleteExam similarly cleaned...