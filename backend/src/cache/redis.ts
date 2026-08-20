import Redis from 'ioredis';
import { config } from '../config';

let client: Redis | null = null;
let connected = false;

export function getRedis(): Redis {
  if (!client) {
    client = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      enableOfflineQueue: false,
    });

    client.on('connect', () => { connected = true; console.log('[Redis] Connected'); });
    client.on('error', (err) => {
      connected = false;
      // Don't crash — Redis is optional for caching
      if (config.isDev) console.warn('[Redis] Error (cache disabled):', err.message);
    });
    client.on('close', () => { connected = false; });

    client.connect().catch(() => {
      console.warn('[Redis] Could not connect — running without cache');
    });
  }
  return client;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    if (!connected) return null;
    const val = await getRedis().get(key);
    return val ? (JSON.parse(val) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  try {
    if (!connected) return;
    const ttl = ttlSeconds ?? config.redis.ttl;
    await getRedis().setex(key, ttl, JSON.stringify(value));
  } catch {
    // silent — cache is best-effort
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    if (!connected) return;
    const redis = getRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) await redis.del(...keys);
  } catch {
    // silent
  }
}

export function isRedisConnected(): boolean {
  return connected;
}
