import { getDatabase } from '../database/connection.js';

export const allQuery = async (sql, params = []) => {
  const result = await getDatabase().execute({ sql, args: params });
  return result.rows;
};

export const getQuery = async (sql, params = []) => {
  const result = await getDatabase().execute({ sql, args: params });
  return result.rows[0];
};

export const runQuery = async (sql, params = []) => {
  const result = await getDatabase().execute({ sql, args: params });
  return { lastID: result.lastInsertRowid, changes: result.rowsAffected };
};