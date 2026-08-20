import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
    return;
  }

  // Postgres unique violation
  if ((err as NodeJS.ErrnoException).code === '23505') {
    res.status(409).json({ error: 'Resource already exists' });
    return;
  }

  console.error('[Error]', err);
  res.status(500).json({
    error: config.isDev ? err.message : 'Internal server error',
    ...(config.isDev ? { stack: err.stack } : {}),
  });
}
