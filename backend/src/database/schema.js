import { runQuery } from '../utils/queryHelpers.js';

export const createTables = async () => {
  console.log('🚀 Initializing database schema on Turso...');

  try {
    // 1. Students Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS students (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        symbol_number TEXT UNIQUE NOT NULL,
        course TEXT NOT NULL,
        shift TEXT NOT NULL,
        batch TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Exams Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS exams (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_name TEXT NOT NULL,
        course TEXT NOT NULL,
        topic_name TEXT NOT NULL,
        nepali_date TEXT NOT NULL,
        shift TEXT NOT NULL,
        total_questions INTEGER DEFAULT 25,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Questions Table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exam_id INTEGER NOT NULL,
        question_number INTEGER NOT NULL,
        question_text TEXT,
        option_a TEXT,
        option_b TEXT,
        option_c TEXT,
        option_d TEXT,
        section TEXT NOT NULL CHECK(section IN ('A', 'B', 'C')),
        difficulty TEXT NOT NULL,
        correct_option TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
        UNIQUE(exam_id, question_number)
      )
    `);

    // 4. Student Answers Table
    await runQuery(`
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
    `);

    // 5. Results Table
    await runQuery(`
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
    `);

    // Add remaining tables (weekly_reports, admin_users, review_requests) here...
    // Also include your CREATE INDEX statements using await runQuery(...)

    console.log('✅ All tables initialized successfully.');
  } catch (err) {
    console.error('❌ Error initializing schema:', err);
    throw err;
  }
};