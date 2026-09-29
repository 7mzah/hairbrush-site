import Database from "better-sqlite3";
import path from "path";
const db = new Database(process.env.DB_PATH || path.join(process.cwd(), "orders.db"));
db.exec(`CREATE TABLE IF NOT EXISTS orders(
 id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, phone TEXT NOT NULL,
 city TEXT NOT NULL, address TEXT NOT NULL, qty INTEGER NOT NULL, total REAL NOT NULL,
 status TEXT NOT NULL DEFAULT 'new', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`);
export default db;
