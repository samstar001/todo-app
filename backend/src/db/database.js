import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import env from "../config/env.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve the DB path and make sure its folder exists
const dbFile = path.resolve(env.dbPath);
fs.mkdirSync(path.dirname(dbFile), { recursive: true });

// Open (or create) the SQLite file
const db = new Database(dbFile);

db.pragma("journal_mode = WAL");

// Create tables on startup if they don't exist yet
const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf-8");
db.exec(schema);

export default db;
