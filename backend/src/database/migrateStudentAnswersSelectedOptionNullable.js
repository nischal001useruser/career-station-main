import { getDatabase } from '../database/connection.js'

/**
 * Ensures student_answers.selected_option allows NULL.
 *
 * SQLite cannot reliably alter NOT NULL constraints.
 * We recreate the table if needed.
 */
export const migrateStudentAnswersSelectedOptionNullable = async () => {
  const db = getDatabase()
  if (!db) {
    // initDatabase must run before this migration
    return
  }

  const table = 'student_answers'
  const column = 'selected_option'

  const getColumnInfo = () =>
    new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(${table})`, (err, rows) => {
        if (err) return reject(err)
        resolve(rows || [])
      })
    })

  const rows = await getColumnInfo()
  const col = rows.find((r) => r.name === column)

  // If column is missing, createTables() should have handled it.
  if (!col) return

  // In SQLite pragma table_info, col.notnull is 1 when NOT NULL exists.
  if (col.notnull === 0) return

  // Recreate table safely while preserving data.
  await new Promise((resolve, reject) => {
    db.serialize(() => {
      // 1) backup
      db.run(`ALTER TABLE ${table} RENAME TO ${table}_old`, (err) => {
        if (err) return reject(err)

        // 2) create new table with nullable selected_option
        db.run(
          `CREATE TABLE IF NOT EXISTS ${table} (
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
          )`,
          (err2) => {
            if (err2) return reject(err2)

            // 3) migrate data; if NOT NULL was enforced, existing rows should have values,
            // but we defensively coerce empty string to NULL for selected_option.
            db.run(
              `INSERT INTO ${table} (id, student_id, exam_id, question_number, selected_option, student_answer, is_correct, created_at)
               SELECT id, student_id, exam_id, question_number,
                      NULLIF(selected_option, '') as selected_option,
                      NULLIF(student_answer, '') as student_answer,
                      is_correct,
                      created_at
               FROM ${table}_old`,
              (err3) => {
                if (err3) return reject(err3)

                // 4) drop old table
                db.run(`DROP TABLE ${table}_old`, (err4) => {
                  if (err4) return reject(err4)
                  resolve()
                })
              }
            )
          }
        )
      })
    })
  })
}

