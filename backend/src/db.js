import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaSql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");

export function createDb(filePath = ":memory:") {
  const db = new Database(filePath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(schemaSql);
  return db;
}

export function defaultDbPath() {
  return process.env.SQLITE_PATH || path.join(__dirname, "..", "data", "acme.sqlite");
}

export function openDb() {
  const filePath = defaultDbPath();
  if (filePath !== ":memory:") {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }
  return createDb(filePath);
}
