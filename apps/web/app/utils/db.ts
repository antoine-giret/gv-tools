import { createHash, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import Database from 'better-sqlite3';

export const DB_PATH = process.env.DATABASE_PATH || 'data.db';
export const BACKUP_DIR = process.env.BACKUP_DIR || path.join(path.dirname(DB_PATH), 'backups');

// Append new migrations at the end, never edit an applied one
const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     geoveloId TEXT NOT NULL UNIQUE,
     username TEXT,
     profilePicture TEXT,
     createdAt TEXT
   );
   CREATE TABLE IF NOT EXISTS sessions (
     tokenHash TEXT PRIMARY KEY,
     userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     createdAt INTEGER NOT NULL
   );`,
];

export const SCHEMA_VERSION = MIGRATIONS.length;

function backupFilePath(name: string) {
  if (!/^[\w.-]+\.db$/.test(name)) throw new Error('Invalid backup name');

  return path.join(BACKUP_DIR, name);
}

export function createBackup(prefix = 'backup') {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const name = `${prefix}-${new Date().toISOString().replace(/[:.]/g, '-')}.db`;

  db.prepare('VACUUM INTO ?').run(backupFilePath(name));

  return name;
}

function migrate() {
  const version = db.pragma('user_version', { simple: true }) as number;

  if (version >= SCHEMA_VERSION) return;

  const hasData = !!db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table'").get();
  if (hasData) createBackup(`pre-migration-v${version}`);

  for (let v = version; v < SCHEMA_VERSION; v++) {
    db.transaction(() => {
      db.exec(MIGRATIONS[v] as string);
      db.pragma(`user_version = ${v + 1}`);
    })();
  }
}

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
migrate();

export function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];

  return fs
    .readdirSync(BACKUP_DIR)
    .filter((name) => /^[\w.-]+\.db$/.test(name))
    .map((name) => {
      const { size, mtime } = fs.statSync(path.join(BACKUP_DIR, name));

      return { name, size, createdAt: mtime.toISOString() };
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function deleteBackup(name: string) {
  fs.rmSync(backupFilePath(name), { force: true });
}

export function backupFileForDownload(name: string) {
  const file = backupFilePath(name);

  return fs.existsSync(file) ? file : null;
}

// Replaces the live data with the content of a backup taken with the same schema version
export function restoreBackup(name: string) {
  const file = backupFilePath(name);

  if (!fs.existsSync(file)) throw new Error('Backup not found');

  createBackup('pre-restore');
  db.prepare('ATTACH DATABASE ? AS restore').run(file);

  try {
    const version = db.pragma('restore.user_version', { simple: true }) as number;

    if (version !== SCHEMA_VERSION)
      throw new Error(`Backup schema version ${version} does not match ${SCHEMA_VERSION}`);

    db.pragma('foreign_keys = OFF');
    db.transaction(() => {
      db.exec(`
        DELETE FROM main.sessions;
        DELETE FROM main.users;
        INSERT INTO main.users SELECT * FROM restore.users;
        INSERT INTO main.sessions SELECT * FROM restore.sessions;
      `);
    })();
  } finally {
    db.pragma('foreign_keys = ON');
    db.exec('DETACH DATABASE restore');
  }
}

export function addOrUpdateUser({
  geoveloId,
  username,
  profilePicture,
  createdAt,
}: {
  geoveloId: string;
  username: string | null;
  profilePicture: string | null;
  createdAt: string | null;
}) {
  db.prepare(
    `INSERT INTO users (geoveloId, username, profilePicture, createdAt)
     VALUES (@geoveloId, @username, @profilePicture, @createdAt)
     ON CONFLICT(geoveloId) DO UPDATE SET
       username = excluded.username,
       profilePicture = excluded.profilePicture,
       createdAt = excluded.createdAt
     WHERE username IS NOT excluded.username
        OR profilePicture IS NOT excluded.profilePicture
        OR createdAt IS NOT excluded.createdAt`,
  ).run({ geoveloId, username, profilePicture, createdAt });
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export function createSession(geoveloId: string) {
  const token = randomBytes(32).toString('hex');
  const now = Math.floor(Date.now() / 1000);

  db.prepare('DELETE FROM sessions WHERE createdAt < ?').run(now - SESSION_MAX_AGE_SECONDS);
  db.prepare(
    'INSERT INTO sessions (tokenHash, userId, createdAt) SELECT ?, id, ? FROM users WHERE geoveloId = ?',
  ).run(hashToken(token), now, geoveloId);

  return token;
}

export function getSessionGeoveloId(token: string) {
  const row = db
    .prepare(
      `SELECT users.geoveloId FROM sessions JOIN users ON users.id = sessions.userId
       WHERE sessions.tokenHash = ? AND sessions.createdAt >= ?`,
    )
    .get(hashToken(token), Math.floor(Date.now() / 1000) - SESSION_MAX_AGE_SECONDS) as
    | { geoveloId: string }
    | undefined;

  return row?.geoveloId;
}

export function getUser(geoveloId: string) {
  return db
    .prepare('SELECT geoveloId, username, profilePicture, createdAt FROM users WHERE geoveloId = ?')
    .get(geoveloId) as
    | {
        geoveloId: string;
        username: string | null;
        profilePicture: string | null;
        createdAt: string | null;
      }
    | undefined;
}

export function adminListUsers() {
  return db
    .prepare(
      `SELECT users.id, users.geoveloId, users.username, users.profilePicture, users.createdAt,
              (SELECT COUNT(*) FROM sessions WHERE sessions.userId = users.id) AS sessionCount
       FROM users ORDER BY users.id`,
    )
    .all();
}

export function adminUpdateUser(
  id: number,
  { username, profilePicture }: { username?: string | null; profilePicture?: string | null },
) {
  return db
    .prepare(
      `UPDATE users SET
         username = CASE WHEN @hasUsername THEN @username ELSE username END,
         profilePicture = CASE WHEN @hasPicture THEN @profilePicture ELSE profilePicture END
       WHERE id = @id`,
    )
    .run({
      id,
      hasUsername: username === undefined ? 0 : 1,
      username: username ?? null,
      hasPicture: profilePicture === undefined ? 0 : 1,
      profilePicture: profilePicture ?? null,
    }).changes;
}

export function adminDeleteUser(id: number) {
  return db.prepare('DELETE FROM users WHERE id = ?').run(id).changes;
}

export function adminDeleteSessions(userId: number) {
  return db.prepare('DELETE FROM sessions WHERE userId = ?').run(userId).changes;
}
