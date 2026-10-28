export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { ready } = await import('./app/utils/db');

  // Create the tables at startup; on failure they are retried on the first query
  await ready().catch((err) => console.error('Database migration failed', err));
}
