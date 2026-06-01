import { getDatabase } from '../database/connection.js'

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
