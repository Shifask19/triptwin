import { createApp } from './app';
import { config } from './config';
import { pool } from './db/pool';
import { getRedis } from './cache/redis';
import { runMigrations } from './db/migrate';
import { runSeed } from './db/seed';

async function bootstrap() {
  // Run migrations automatically on every startup
  try {
    await runMigrations();
  } catch (err) {
    console.error('[server] Migration failed — continuing anyway:', (err as Error).message);
  }

  // Seed demo data only if no users exist yet
  try {
    const { pool: p } = await import('./db/pool');
    const res = await p.query('SELECT COUNT(*) FROM users');
    const count = parseInt((res.rows[0] as { count: string }).count, 10);
    if (count === 0) {
      console.log('[server] No users found — running seed...');
      await runSeed();
    } else {
      console.log(`[server] Database has ${count} user(s) — skipping seed`);
    }
  } catch (err) {
    console.error('[server] Seed check failed:', (err as Error).message);
  }

  const app = createApp();

  const server = app.listen(config.port, () => {
    console.log(`
╔═══════════════════════════════════════════════╗
║         TripTwin API Server                   ║
╠═══════════════════════════════════════════════╣
║  Port     : ${String(config.port).padEnd(10)}                    ║
║  Env      : ${config.env.padEnd(10)}                    ║
║  AI       : ${config.ai.provider.padEnd(10)}                    ║
║  Prefix   : ${config.apiPrefix.padEnd(10)}                    ║
╚═══════════════════════════════════════════════╝
    `);
  });

  async function shutdown(signal: string) {
    console.log(`\n[server] ${signal} — shutting down...`);
    server.close(async () => {
      try { await pool.end(); } catch { /* ignore */ }
      try { const redis = getRedis(); await redis.quit(); } catch { /* ignore */ }
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000);
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason) => {
    console.error('[server] Unhandled rejection:', reason);
    if (config.isDev) process.exit(1);
  });

  process.on('uncaughtException', (err) => {
    console.error('[server] Uncaught exception:', err);
    process.exit(1);
  });
}

bootstrap();
