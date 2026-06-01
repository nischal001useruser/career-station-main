/**
 * Database Helpers
 * Reusable functions for common database operations
 */

import { getDatabase } from './connection.js'

/**
 * Run a query that modifies data (INSERT, UPDATE, DELETE)
 */
export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.run(sql, params, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve({ lastID: this.lastID, changes: this.changes })
      }
    })
  })
}

/**
 * Fetch a single row
 */
export const getQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err)
      } else {
        resolve(row)
      }
    })
  })
}

/**
 * Fetch multiple rows
 */
export const allQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows || [])
      }
    })
  })
}

/**
 * Execute a transaction
 */
export const transactionQuery = (queries = []) => {
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) return reject(err)

        let results = []
        let completed = 0

        queries.forEach((query, index) => {
          if (query.type === 'run') {
            db.run(query.sql, query.params, function (err) {
              if (err) {
                db.run('ROLLBACK', () => reject(err))
              } else {
                results[index] = { lastID: this.lastID, changes: this.changes }
                completed++
                if (completed === queries.length) {
                  db.run('COMMIT', (err) => {
                    if (err) reject(err)
                    else resolve(results)
                  })
                }
              }
            })
          } else if (query.type === 'get') {
            db.get(query.sql, query.params, (err, row) => {
              if (err) {
                db.run('ROLLBACK', () => reject(err))
              } else {
                results[index] = row
                completed++
                if (completed === queries.length) {
                  db.run('COMMIT', (err) => {
                    if (err) reject(err)
                    else resolve(results)
                  })
                }
              }
            })
          }
        })
      })
    })
  })
}

/**
 * Count records matching condition
 */
export const countQuery = (table, whereClause = '') => {
  const sql = `SELECT COUNT(*) as count FROM ${table} ${whereClause}`
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.get(sql, (err, row) => {
      if (err) reject(err)
      else resolve(row?.count || 0)
    })
  })
}

/**
 * Get paginated results
 */
export const paginatedQuery = (sql, params = [], page = 1, pageSize = 10) => {
  const offset = (page - 1) * pageSize
  const paginatedSql = `${sql} LIMIT ${pageSize} OFFSET ${offset}`
  return allQuery(paginatedSql, params)
}

/**
 * Check if record exists
 */
export const existsQuery = (table, whereClause, params = []) => {
  const sql = `SELECT 1 FROM ${table} WHERE ${whereClause} LIMIT 1`
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.get(sql, params, (err, row) => {
      if (err) reject(err)
      else resolve(!!row)
    })
  })
}

/**
 * Get distinct values
 */
export const distinctQuery = (table, column, whereClause = '') => {
  const sql = `SELECT DISTINCT ${column} FROM ${table} ${whereClause}`
  return new Promise((resolve, reject) => {
    const db = getDatabase()
    db.all(sql, (err, rows) => {
      if (err) reject(err)
      else resolve((rows || []).map(row => row[column]))
    })
  })
}
