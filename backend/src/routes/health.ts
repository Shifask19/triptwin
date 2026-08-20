import { Router, Request, Response } from 'express';
import { dbHealthCheck } from '../db/pool';
import { isRedisConnected } from '../cache/redis';
import { config } from '../config';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  const db = await dbHealthCheck();
  const redis = isRedisConnected();

  // Only DB down = degraded. Redis is optional caching — never causes unhealthy.
  const status = db ? 'healthy' : 'degraded';

  res.status(200).json({   // always 200 so Docker healthcheck passes when DB is up
    status,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: config.env,
    aiProvider: config.ai.provider,
    services: {
      database: db    ? 'up' : 'down',
      redis:    redis ? 'up' : 'down (cache disabled — non-critical)',
      api:      'up',
    },
  });
});

export default router;
