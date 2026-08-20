import { createApp } from './app';
import { config } from './config';
import { pool } from './db/pool';
import { getRedis } from './cache/redis';

async function setupDatabase() {
  // Dynamic import to avoid issues when pg can't connect
  const { runMigrations } = await import('./db/migrate');
  const { runSeed } = await import('./db/seed');

  try {
    await runMigrations();
  } catch (err) {
    console.error('[server] Migration error:', (err as Error).message);
    // Don't crash — tables might already exist
  }

  try {
    const res = await pool.query('SELECT COUNT(*) as count FROM users');
    const count = parseInt((res.rows[0] as { count: string }).count, 10);
    if (count === 0) {
      console.log('[server] Empty database — seeding demo data...');
      await runSeed();
    } else {
      console.log(`[server] ${count} user(s) in database — skipping seed`);
    }
  } catch (err) {
    console.error('[server] Seed error (non-fatal):', (err as Error).message);
  }
}

async function startServer() {
  // Only run DB setup on the first worker or in standalone mode
  const isFirstWorker = !process.env.CLUSTER_WORKER_ID || process.env.CLUSTER_WORKER_ID === '1';
  if (isFirstWorker) {
    await setupDatabase();
  }

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`[TripTwin] Server running on port ${config.port} | env=${config.env} | ai=${config.ai.provider}`);
  });

  async function shutdown(signal: string) {
    console.log(`[server] ${signal} — shutting down gracefully`);
    server.close(async () => {
      try { await pool.end(); } catch { /* ignore */ }
      try { const r = getRedis(); await r.quit(); } catch { /* ignore */ }
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
  process.on('unhandledRejection', (r) => console.error('[server] Unhandled rejection:', r));
  process.on('uncaughtException',  (e) => { console.error('[server] Uncaught:', e); process.exit(1); });
}

startServer();
