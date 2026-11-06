import { createHash, randomBytes } from 'node:crypto';

import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { pgPool?: Pool; pgMigration?: Promise<void> };

const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/geovelo_tools',
  });

globalForPg.pgPool = pool;

// Append new migrations at the end, never edit an applied one
const MIGRATIONS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
     id SERIAL PRIMARY KEY,
     "geoveloId" TEXT NOT NULL UNIQUE,
     username TEXT,
     "profilePicture" TEXT,
     "createdAt" TEXT
   );
   CREATE TABLE IF NOT EXISTS sessions (
     "tokenHash" TEXT PRIMARY KEY,
     "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     "createdAt" BIGINT NOT NULL
   );`,
  `ALTER TABLE users ADD COLUMN "tracesSyncedAt" TIMESTAMPTZ;
   CREATE TABLE IF NOT EXISTS user_h3_cells (
     "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
     "h3Index" TEXT NOT NULL,
     "traceId" BIGINT NOT NULL,
     "visitedAt" TIMESTAMPTZ,
     PRIMARY KEY ("userId", "h3Index", "traceId")
   );`,
  // Uncleaned traces used to be stored: start over with a full sync
  `DELETE FROM user_h3_cells;
   UPDATE users SET "tracesSyncedAt" = NULL;
   CREATE INDEX IF NOT EXISTS user_h3_cells_trace ON user_h3_cells ("userId", "traceId");`,
];

const MIGRATION_LOCK_ID = 727274;

async function migrate() {
  const client = await pool.connect();

  try {
    // Serializes concurrent migrations across processes
    await client.query('SELECT pg_advisory_lock($1)', [MIGRATION_LOCK_ID]);
    await client.query(
      'CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)',
    );

    const { rows } = await client.query<{ version: number | null }>(
      'SELECT MAX(version) AS version FROM schema_migrations',
    );

    for (let v = rows[0]?.version ?? 0; v < MIGRATIONS.length; v++) {
      try {
        await client.query('BEGIN');
        await client.query(MIGRATIONS[v] as string);
        await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [v + 1]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [MIGRATION_LOCK_ID]).catch(() => undefined);
    client.release();
  }
}

export function ready() {
  globalForPg.pgMigration ??= migrate().catch((err) => {
    globalForPg.pgMigration = undefined;
    throw err;
  });

  return globalForPg.pgMigration;
}

async function query<T extends object = Record<string, unknown>>(text: string, values?: unknown[]) {
  await ready();

  return pool.query<T>(text, values);
}

export async function addOrUpdateUser({
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
  await query(
    `INSERT INTO users ("geoveloId", username, "profilePicture", "createdAt")
     VALUES ($1, $2, $3, $4)
     ON CONFLICT ("geoveloId") DO UPDATE SET
       username = EXCLUDED.username,
       "profilePicture" = EXCLUDED."profilePicture",
       "createdAt" = EXCLUDED."createdAt"
     WHERE users.username IS DISTINCT FROM EXCLUDED.username
        OR users."profilePicture" IS DISTINCT FROM EXCLUDED."profilePicture"
        OR users."createdAt" IS DISTINCT FROM EXCLUDED."createdAt"`,
    [geoveloId, username, profilePicture, createdAt],
  );
}

export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function createSession(geoveloId: string) {
  const token = randomBytes(32).toString('hex');
  const now = Math.floor(Date.now() / 1000);

  await query('DELETE FROM sessions WHERE "createdAt" < $1', [now - SESSION_MAX_AGE_SECONDS]);
  await query(
    `INSERT INTO sessions ("tokenHash", "userId", "createdAt")
     SELECT $1, id, $2 FROM users WHERE "geoveloId" = $3`,
    [hashToken(token), now, geoveloId],
  );

  return token;
}

export async function getSessionGeoveloId(token: string) {
  const { rows } = await query<{ geoveloId: string }>(
    `SELECT users."geoveloId" FROM sessions JOIN users ON users.id = sessions."userId"
     WHERE sessions."tokenHash" = $1 AND sessions."createdAt" >= $2`,
    [hashToken(token), Math.floor(Date.now() / 1000) - SESSION_MAX_AGE_SECONDS],
  );

  return rows[0]?.geoveloId;
}

export async function getUser(geoveloId: string) {
  const { rows } = await query<{
    geoveloId: string;
    username: string | null;
    profilePicture: string | null;
    createdAt: string | null;
  }>(
    'SELECT "geoveloId", username, "profilePicture", "createdAt" FROM users WHERE "geoveloId" = $1',
    [geoveloId],
  );

  return rows[0];
}

export async function getTracesSyncedAt(geoveloId: string) {
  const { rows } = await query<{ tracesSyncedAt: Date | null }>(
    'SELECT "tracesSyncedAt" FROM users WHERE "geoveloId" = $1',
    [geoveloId],
  );

  return rows[0]?.tracesSyncedAt ?? null;
}

export async function setTracesSyncedAt(geoveloId: string, tracesSyncedAt: Date) {
  // Never moves backwards: a resumed sync may restart before the date already saved
  await query(
    `UPDATE users SET "tracesSyncedAt" = GREATEST("tracesSyncedAt", $1)
     WHERE "geoveloId" = $2`,
    [tracesSyncedAt, geoveloId],
  );
}

export async function getStoredTraceIds(geoveloId: string, traceIds: number[]) {
  const { rows } = await query<{ traceId: string }>(
    `SELECT DISTINCT cells."traceId" FROM user_h3_cells AS cells
     JOIN users ON users.id = cells."userId"
     WHERE users."geoveloId" = $1 AND cells."traceId" = ANY($2::bigint[])`,
    [geoveloId, traceIds],
  );

  // BIGINT columns are returned as strings
  return new Set(rows.map(({ traceId }) => Number(traceId)));
}

export async function addH3Cells(
  geoveloId: string,
  cells: { h3Index: string; traceId: number; visitedAt: string | null }[],
) {
  if (cells.length === 0) return;

  // Re-synced traces are ignored thanks to the primary key
  await query(
    `INSERT INTO user_h3_cells ("userId", "h3Index", "traceId", "visitedAt")
     SELECT users.id, cells."h3Index", cells."traceId", cells."visitedAt"
     FROM users, unnest($2::text[], $3::bigint[], $4::timestamptz[])
       AS cells("h3Index", "traceId", "visitedAt")
     WHERE users."geoveloId" = $1
     ON CONFLICT DO NOTHING`,
    [
      geoveloId,
      cells.map(({ h3Index }) => h3Index),
      cells.map(({ traceId }) => traceId),
      cells.map(({ visitedAt }) => visitedAt),
    ],
  );
}

// Cells whose first visit ever is within [startDate, endDate)
export async function getNewH3Cells(geoveloId: string, startDate: Date, endDate: Date) {
  const { rows } = await query<{ h3Index: string }>(
    `SELECT "h3Index" FROM (
       SELECT cells."h3Index", MIN(cells."visitedAt") AS "firstVisitedAt"
       FROM user_h3_cells AS cells JOIN users ON users.id = cells."userId"
       WHERE users."geoveloId" = $1
       GROUP BY cells."h3Index"
     ) AS first_visits
     WHERE "firstVisitedAt" >= $2 AND "firstVisitedAt" < $3`,
    [geoveloId, startDate, endDate],
  );

  return rows.map(({ h3Index }) => h3Index);
}
