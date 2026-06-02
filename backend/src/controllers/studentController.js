import { allQuery, getQuery, runQuery } from '../utils/queryHelpers.js'
import { sendSuccess, handleError } from '../utils/responseHelpers.js'

export const getAllStudents = async (req, res) => {
  try {
    // UPDATED: Changed 'ORDER BY created_at DESC' to 'ORDER BY full_name ASC'
    const students = await allQuery('SELECT * FROM students ORDER BY full_name ASC')
    sendSuccess(res, students, 'Students retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params
    const student = await getQuery('SELECT * FROM students WHERE id = ?', [id])
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }
    sendSuccess(res, student, 'Student retrieved successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const createStudent = async (req, res) => {
  try {
    const { full_name, symbol_number, course, shift, batch } = req.body

    if (!full_name || !symbol_number || !course || !shift || !batch) {
      return res.status(400).json({ success: false, message: 'Full name, symbol number, course, shift, and batch are required' })
    }

    const result = await runQuery(
      'INSERT INTO students (full_name, symbol_number, course, shift, batch) VALUES (?, ?, ?, ?, ?)',
      [full_name, symbol_number, course, shift, batch]
    )

    sendSuccess(res, { id: result.lastID }, 'Student created successfully', 201)
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ success: false, message: 'Symbol number already exists' })
    }
    handleError(res, error)
  }
}

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params
    const { full_name, symbol_number, course, shift, batch } = req.body

    const existingStudent = await getQuery('SELECT * FROM students WHERE id = ?', [id])
    if (!existingStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    await runQuery(
      'UPDATE students SET full_name = ?, symbol_number = ?, course = ?, shift = ?, batch = ? WHERE id = ?',
      [full_name || existingStudent.full_name, symbol_number || existingStudent.symbol_number, course || existingStudent.course, shift || existingStudent.shift, batch || existingStudent.batch, id]
    )

    sendSuccess(res, { id }, 'Student updated successfully')
  } catch (error) {
    handleError(res, error)
  }
}

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params

    const student = await getQuery('SELECT * FROM students WHERE id = ?', [id])
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' })
    }

    await runQuery('DELETE FROM students WHERE id = ?', [id])
    sendSuccess(res, { id }, 'Student deleted successfully')
  } catch (error) {
    handleError(res, error)
  }
}