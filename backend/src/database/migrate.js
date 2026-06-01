/**
 * Database Migration Script
 * Resets and reinitializes the database
 * CAUTION: This will delete all data!
 */

import sqlite3 from 'sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, '../../database/exams.db')
const dbDir = path.dirname(dbPath)

console.log('⚠️  WARNING: This will delete all database data!\n')

const migrate = () => {
  // Create database directory if it doesn't exist
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true })
    console.log(`✓ Created database directory: ${dbDir}`)
  }

  // Remove existing database
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath)
    console.log(`✓ Deleted existing database`)
  }

  // Create fresh database
  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('Error creating database:', err)
      process.exit(1)
    }

    console.log(`✓ Created new database at: ${dbPath}`)

    // Run schema creation
    const { createTables } = await import('./schema.js')
    createTables(db)

    console.log(`\n✓ Database migration completed!`)
    console.log(`Run 'npm run seed' to populate sample data\n`)

    db.close()
  })
}

migrate()
