/**
 * Database Schema Definitions
 * Creates all tables for Career Station Exam Analytics System
 * Migrated to support Turso Cloud SQLite (@libsql/client)
 */

const ensureColumn = async (db, table, columnName, definition) => {
  try {
    const res = await db.execute(`PRAGMA table_info(${table})`)
    const exists = res.rows.some((row) => row.name === columnName)
    
    if (!exists) {
      await db.execute(`ALTER TABLE ${table} ADD COLUMN ${definition}`)
      console.log(`✓ Added missing column ${columnName} to ${table}`)
    }
  } catch (err) {
    console.error(`Error handling migration column check for ${table}.${columnName}:`, err)
  }
}

export const createTables = async (db) => {
  try {
    // 1. Students table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        symbol_number TEXT UNIQUE NOT NULL,
        course TEXT NOT NULL,
        shift TEXT NOT NULL,
        batch TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ students table initialized')

    // 2. Exams table (Updated to support 25marks, 100marks, and custom mode)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_name TEXT NOT NULL,
        course TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        nepali_date TEXT NOT NULL,
        shift TEXT NOT NULL,
        exam_mode TEXT NOT NULL DEFAULT '25marks',
        total_questions INTEGER DEFAULT 25,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ exams table initialized')

    // 3. Questions table (CHECK constraint loosened to allow 'CUSTOM' or arbitrary dynamic mode classifications)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT,
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        section TEXT NOT NULL CHECK(section IN ('A', 'B', 'C', 'CUSTOM', 'NONE')),
        difficulty TEXT NOT NULL,
        correct_option TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        UNIQUE(exam_id, question_number)
      )
    `)
    console.log('✓ questions table initialized')

    // 4. Student Answers table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS student_answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        question_number INTEGER NOT NULL,
        selected_option TEXT,
        student_answer TEXT,
        is_correct BOOLEAN NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        UNIQUE(student_id, exam_id, question_number)
      )
    `)
    console.log('✓ student_answers table initialized')

    // 5. Results table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        attendance_status TEXT NOT NULL DEFAULT 'PRESENT',
        score INTEGER NOT NULL,
        percentage REAL NOT NULL,
        rank INTEGER,
        section_a_score INTEGER DEFAULT 0,
        section_b_score INTEGER DEFAULT 0,
        section_c_score INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP,
        updated_by TEXT,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        UNIQUE(student_id, exam_id)
      )
    `)
    console.log('✓ results table initialized')

    // 6. Weekly Reports table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS weekly_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        week_start TEXT NOT NULL,
        week_end TEXT NOT NULL,
        ai_feedback TEXT,
        teacher_remark TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
      )
    `)
    console.log('✓ weekly_reports table initialized')

    // 7. Admin Users table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('✓ admin_users table initialized')

    // 8. Review Requests table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS review_requests (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER NOT NULL,
        exam_id INTEGER NOT NULL,
        question_number TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
      )
    `)
    console.log('✓ review_requests table initialized')

    // Dynamic schema corrections / checks for backwards-compatibility safety
    await ensureColumn(db, 'exams', 'exam_mode', "exam_mode TEXT NOT NULL DEFAULT '25marks'")
    await ensureColumn(db, 'questions', 'question_text', 'question_text TEXT')
    await ensureColumn(db, 'questions', 'option_a', 'option_a TEXT')
    await ensureColumn(db, 'questions', 'option_b', 'option_b TEXT')
    await ensureColumn(db, 'questions', 'option_c', 'option_c TEXT')
    await ensureColumn(db, 'questions', 'option_d', 'option_d TEXT')
    await ensureColumn(db, 'results', 'updated_at', 'updated_at TIMESTAMP')
    await ensureColumn(db, 'results', 'updated_by', 'updated_by TEXT')
    await ensureColumn(db, 'results', 'attendance_status', "attendance_status TEXT NOT NULL DEFAULT 'PRESENT'")
    await ensureColumn(db, 'student_answers', 'student_answer', 'student_answer TEXT')

    // Performance Index Initializations
    await db.execute('CREATE INDEX IF NOT EXISTS idx_students_course ON students(course)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_students_shift ON students(shift)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_questions_exam_id ON questions(exam_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_questions_section ON questions(section)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_student_answers_exam_id ON student_answers(exam_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_student_answers_student_id ON student_answers(student_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_results_exam_id ON results(exam_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_results_student_id ON results(student_id)')
    await db.execute('CREATE INDEX IF NOT EXISTS idx_weekly_reports_student_id ON weekly_reports(student_id)')
    
    console.log('✓ All system indexes verified successfully.')
  } catch (error) {
    console.error('Critical Error during system schema creation execution:', error)
    throw error
  }
}