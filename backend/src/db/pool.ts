import { Pool, PoolClient } from 'pg';
import { config } from '../config';

// Determine SSL: only enable for external hosted DBs (not Docker-internal or localhost)
function sslConfig() {
  const url = config.db.url;
  const isLocal = url.includes('localhost') ||
                  url.includes('127.0.0.1') ||
                  url.includes('@postgres:') ||
                  url.includes('@db:');
  if (isLocal) return false;
  if (process.env.DB_SSL === 'false') return false;
  if (process.env.DB_SSL === 'true') return { rejectUnauthorized: false };
  return false; // default: no SSL (safe for Docker-internal Postgres)
}

// Connection pool — shared across the entire process
export const pool = new Pool({
  connectionString: config.db.url,
  max: config.db.poolMax,
  idleTimeoutMillis: config.db.poolIdleTimeout,
  connectionTimeoutMillis: 5000,
  ssl: sslConfig(),
});

pool.on('connect', () => {
  if (config.isDev) console.log('[DB] New client connected');
});

pool.on('error', (err) => {
  console.error('[DB] Unexpected pool error:', err.message);
});

// Typed query helper
export async function query<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const start = Date.now();
  const res = await pool.query(text, params);
  if (config.isDev) {
    console.log(`[DB] ${text.slice(0, 80)} — ${Date.now() - start}ms`);
  }
  return res.rows as T[];
}

// Single row helper
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

// Transaction helper
export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// Health check — lightweight, used by /health endpoint and Docker HEALTHCHECK
export async function dbHealthCheck(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (err) {
    console.error('[DB] Health check failed:', (err as Error).message);
    return false;
  }
}
