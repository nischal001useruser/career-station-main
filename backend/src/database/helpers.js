import { getDatabase } from './connection.js'

// Helper to run query via Turso client
const execute = async (sql, params) => await getDatabase().execute({ sql, args: params || [] })

// Convert Turso rows into plain JavaScript objects for safety
const formatRow = (row) => row ? { ...row } : null
const formatRows = (rows) => rows ? rows.map(r => ({ ...r })) : []

export const runQuery = async (sql, params) => {
  const res = await execute(sql, params)
  return { lastID: res.lastInsertRowid ? Number(res.lastInsertRowid) : null, changes: res.rowsAffected }
}

export const getQuery = async (sql, params) => formatRow((await execute(sql, params)).rows[0])
export const allQuery = async (sql, params) => formatRows((await execute(sql, params)).rows)

export const transactionQuery = async (queries = []) => {
  const formatted = queries.map(q => ({ sql: q.sql, args: q.params || [] }))
  const results = await getDatabase().batch(formatted, 'write')
  return results.map((res, i) => 
    queries[i].type === 'get' 
      ? formatRow(res.rows[0]) 
      : { lastID: res.lastInsertRowid ? Number(res.lastInsertRowid) : null, changes: res.rowsAffected }
  )
}

export const countQuery = async (table, where = '') => (await getQuery(`SELECT COUNT(*) as count FROM ${table} ${where}`))?.count || 0
export const paginatedQuery = async (sql, params, page = 1, size = 10) => await allQuery(`${sql} LIMIT ${size} OFFSET ${(page - 1) * size}`, params)
export const existsQuery = async (table, where, params) => !!(await getQuery(`SELECT 1 FROM ${table} WHERE ${where} LIMIT 1`, params))
export const distinctQuery = async (table, col, where = '') => (await allQuery(`SELECT DISTINCT ${col} FROM ${table} ${where}`)).map(r => r[col])