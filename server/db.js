import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'

const dataDir = path.resolve(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'sitevagas.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    segment TEXT,
    site TEXT,
    careers TEXT,
    linkedin TEXT,
    notes TEXT,
    created_at TEXT NOT NULL
  );
`)

db.exec(`
  CREATE TABLE IF NOT EXISTS vacancies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    modality TEXT,
    level TEXT,
    description TEXT,
    link TEXT NOT NULL,
    date TEXT,
    tags TEXT,
    created_at TEXT NOT NULL
  );
`)

export default db
