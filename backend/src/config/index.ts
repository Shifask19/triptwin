import dotenv from 'dotenv';
dotenv.config();

function required(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  env: optional('NODE_ENV', 'development'),
  port: parseInt(optional('PORT', '4000'), 10),
  apiPrefix: optional('API_PREFIX', '/api/v1'),
  isDev: optional('NODE_ENV', 'development') === 'development',
  isProd: optional('NODE_ENV', 'development') === 'production',

  db: {
    url: optional('DATABASE_URL', 'postgresql://triptwin:password@localhost:5432/triptwin'),
    poolMax: parseInt(optional('DB_POOL_MAX', '20'), 10),
    poolIdleTimeout: parseInt(optional('DB_POOL_IDLE_TIMEOUT', '30000'), 10),
  },

  redis: {
    url: optional('REDIS_URL', 'redis://localhost:6379'),
    ttl: parseInt(optional('REDIS_TTL', '300'), 10), // 5 min default cache
  },

  jwt: {
    secret: optional('JWT_SECRET', 'dev_jwt_secret_change_in_production'),
    expiresIn: optional('JWT_EXPIRES_IN', '7d'),
    refreshExpiresIn: optional('JWT_REFRESH_EXPIRES_IN', '30d'),
  },

  ai: {
    provider: optional('AI_PROVIDER', 'mock') as 'openai' | 'groq' | 'mock',
    openai: {
      apiKey: optional('OPENAI_API_KEY', ''),
      model: optional('OPENAI_MODEL', 'gpt-4o-mini'),
    },
    groq: {
      apiKey: optional('GROQ_API_KEY', ''),
      model: optional('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    },
  },

  cors: {
    origins: optional('CORS_ORIGINS', 'http://localhost:5173').split(',').map(s => s.trim()),
  },

  rateLimit: {
    windowMs: parseInt(optional('RATE_LIMIT_WINDOW_MS', '900000'), 10),
    max: parseInt(optional('RATE_LIMIT_MAX', '200'), 10),
    aiMax: parseInt(optional('AI_RATE_LIMIT_MAX', '30'), 10),
  },
};
