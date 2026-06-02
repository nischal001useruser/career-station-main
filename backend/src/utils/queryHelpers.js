import 'dotenv/config'; 
import { createClient } from "@libsql/client";

const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
// ... rest of the file

export const allQuery = async (sql, params = []) => {
  try {
    const result = await db.execute({ sql, args: params });
    return result.rows;
  } catch (error) {
    console.error("Database allQuery error:", error);
    throw error;
  }
};
// ... keep getQuery and runQuery as they were

/**
 * Executes a query that returns a single row.
 */
export const getQuery = async (sql, params = []) => {
  try {
    const result = await db.execute({ sql, args: params });
    return result.rows[0] || null;
  } catch (error) {
    console.error("Database getQuery error:", error);
    throw error;
  }
};

/**
 * Executes a query (INSERT, UPDATE, DELETE).
 */
export const runQuery = async (sql, params = []) => {
  try {
    const result = await db.execute({ sql, args: params });
    // Returns the result object, which includes lastInsertRowid
    return { lastID: result.lastInsertRowid };
  } catch (error) {
    console.error("Database runQuery error:", error);
    throw error;
  }
};