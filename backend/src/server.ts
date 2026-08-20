import { createApp } from './app';
import { config } from './config';
import { pool } from './db/pool';
import { getRedis } from './cache/redis';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║         TripTwin API Server                   ║
╠═══════════════════════════════════════════════╣
║  Port     : ${config.port}                            ║
║  Env      : ${config.env.padEnd(10)}                     ║
║  AI       : ${config.ai.provider.padEnd(10)}                     ║
║  Prefix   : ${config.apiPrefix.padEnd(10)}                     ║
╚═══════════════════════════════════════════════╝
  `);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
async function shutdown(signal: string) {
  console.log(`\n[server] ${signal} received — shutting down gracefully...`);

  server.close(async () => {
    try {
      await pool.end();
      console.log('[server] PostgreSQL pool closed');

      const redis = getRedis();
      await redis.quit();
      console.log('[server] Redis disconnected');
    } catch {
      // ignore cleanup errors
    }
    process.exit(0);
  });

  // Force kill after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('[server] Forced shutdown after timeout');
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// Catch unhandled errors — log but don't crash in production
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason);
  if (config.isDev) process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err);
  process.exit(1);
});

export default server;
