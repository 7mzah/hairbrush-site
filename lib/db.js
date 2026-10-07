import { createClient } from "@libsql/client";
import path from "path";

// Supports both:
// 1. Turso (libSQL in the cloud): set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN
// 2. Local file (SQLite): defaults to orders.db in the project root
const url =
  process.env.TURSO_DATABASE_URL ||
  `file:${process.env.DB_PATH || path.join(process.cwd(), "orders.db")}`;

export const db = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

let initPromise = null;
export async function getDb() {
  if (!initPromise) {
    initPromise = db.execute(`CREATE TABLE IF NOT EXISTS orders(
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL,
      city TEXT NOT NULL, address TEXT NOT NULL, qty INTEGER NOT NULL, total REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
  }
  await initPromise;
  return db;
}

export default db;
