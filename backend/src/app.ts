import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { config } from './config';
import { notFound, errorHandler } from './middleware/errorHandler';

import healthRouter    from './routes/health';
import authRouter      from './routes/auth';
import tripsRouter     from './routes/trips';
import activitiesRouter from './routes/activities';
import twinRouter      from './routes/twin';
import aiRouter        from './routes/ai';
import budgetRouter    from './routes/budget';
import memoryRouter    from './routes/memory';

export function createApp() {
  const app = express();

  // ─── Trust proxy (needed behind Nginx) ─────────────────────────────────────
  app.set('trust proxy', 1);

  // ─── Security headers ───────────────────────────────────────────────────────
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  // ─── CORS ───────────────────────────────────────────────────────────────────
  app.use(cors({
    origin: config.cors.origins,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // ─── Compression ────────────────────────────────────────────────────────────
  app.use(compression());

  // ─── Body parsing ───────────────────────────────────────────────────────────
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // ─── Request logging ────────────────────────────────────────────────────────
  if (config.isDev) {
    app.use(morgan('dev'));
  } else {
    app.use(morgan('combined'));
  }

  // ─── Global rate limit ──────────────────────────────────────────────────────
  app.use(rateLimit({
    windowMs: config.rateLimit.windowMs,
    max:      config.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  }));

  // ─── Stricter rate limit for AI endpoints ───────────────────────────────────
  const aiLimit = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max:      config.rateLimit.aiMax,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'AI rate limit reached. Please wait before making more AI requests.' },
  });

  // ─── Routes ─────────────────────────────────────────────────────────────────
  const prefix = config.apiPrefix;

  app.use(`${prefix}/health`,     healthRouter);
  app.use(`${prefix}/auth`,       authRouter);
  app.use(`${prefix}/trips`,      tripsRouter);
  app.use(`${prefix}/twin`,       twinRouter);
  app.use(`${prefix}/ai`,         aiLimit, aiRouter);
  app.use(`${prefix}/memory`,     memoryRouter);

  // Nested: activities and budget live under trips
  app.use(`${prefix}/trips/:tripId/activities`, activitiesRouter);
  app.use(`${prefix}/trips/:tripId/budget`,     budgetRouter);

  // ─── 404 & error handler ────────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
