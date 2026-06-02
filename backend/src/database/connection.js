import { createClient } from '@libsql/client'
import path from 'path'
import { fileURLToPath } from 'url'
import { createTables } from './schema.js'
import { migrateStudentAnswersSelectedOptionNullable } from './migrateStudentAnswersSelectedOptionNullable.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Detect if running live on Render
const isProduction = process.env.RENDER === 'true'

let db = null

export const initDatabase = async () => {
  try {
    if (isProduction) {
      console.log('Connecting to Turso Cloud SQLite Database...')
      db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
      })
    } else {
      console.log('Connecting to Local SQLite File Database...')
      const localPath = path.resolve(__dirname, '../../data/exams.db')
      db = createClient({ url: `file:${localPath}` })
    }

    // Initialize tables using the new cloud client
    await createTables(db)

    // Run the migration safely
    await migrateStudentAnswersSelectedOptionNullable()
      .catch((e) => console.error('Migration failed:', e))

    console.log('Database initialized successfully.')
    return db
  } catch (error) {
    console.error('Failed to initialize database:', error)
    throw error
  }
}

// Returns the active Turso client instance
export const getDatabase = () => db

export const closeDatabase = async () => {
  if (db) {
    try {
      await db.close()
      console.log('Database connection closed')
    } catch (err) {
      console.error('Error closing database:', err)
    }
  }
}