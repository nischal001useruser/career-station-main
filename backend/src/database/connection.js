import 'dotenv/config';
import { createClient } from "@libsql/client";

// Ensure these exist in your .env file
const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "libsql://career-station-db-nischal001useruser.aws-ap-south-1.turso.io",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const initDatabase = async () => {
  try {
    console.log("Connected to Turso database");
    // Note: If you have a schema.js that relies on `db.run`, 
    // you will need to rewrite those functions to use `db.execute`
    return db;
  } catch (err) {
    console.error("Failed to connect to Turso:", err);
    throw err;
  }
};

export const getDatabase = () => db;

// closeDatabase is no longer needed for Turso/libSQL 
// as the client manages connections automatically
export const closeDatabase = () => {};