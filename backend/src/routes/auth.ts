import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne } from '../db/pool';
import { generateTokens, authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { config } from '../config';

const router = Router();

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ errors: errors.array() });
    return;
  }
  next();
};

// POST /auth/register
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('name').trim().notEmpty(),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, name } = req.body as { email: string; password: string; name: string };

      const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
      if (existing) throw new AppError(409, 'Email already registered');

      const hash = await bcrypt.hash(password, 12);
      const users = await query<{ id: string; email: string; name: string }>(
        'INSERT INTO users (email, password, name) VALUES ($1,$2,$3) RETURNING id, email, name',
        [email, hash, name]
      );
      const user = users[0];

      // Create empty Travel Twin
      await query(
        `INSERT INTO travel_twins (user_id, preferences, spending_profile)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [user.id, JSON.stringify({}), JSON.stringify({})]
      );

      const tokens = generateTokens({ userId: user.id, email: user.email });

      // Persist refresh token
      await query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
        [user.id, tokens.refreshToken]
      );

      res.status(201).json({ user: { id: user.id, email: user.email, name: user.name }, ...tokens });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/login
router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as { email: string; password: string };

      const user = await queryOne<{ id: string; email: string; name: string; password: string }>(
        'SELECT id, email, name, password FROM users WHERE email = $1',
        [email]
      );
      if (!user) throw new AppError(401, 'Invalid credentials');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new AppError(401, 'Invalid credentials');

      const tokens = generateTokens({ userId: user.id, email: user.email });

      await query(
        `INSERT INTO refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
        [user.id, tokens.refreshToken]
      );

      res.json({ user: { id: user.id, email: user.email, name: user.name }, ...tokens });
    } catch (err) {
      next(err);
    }
  }
);

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body as { refreshToken: string };
    if (!refreshToken) throw new AppError(401, 'Missing refresh token');

    const stored = await queryOne<{ user_id: string; expires_at: string }>(
      'SELECT user_id, expires_at FROM refresh_tokens WHERE token = $1',
      [refreshToken]
    );
    if (!stored) throw new AppError(401, 'Invalid refresh token');
    if (new Date(stored.expires_at) < new Date()) throw new AppError(401, 'Refresh token expired');

    const user = await queryOne<{ id: string; email: string; name: string }>(
      'SELECT id, email, name FROM users WHERE id = $1',
      [stored.user_id]
    );
    if (!user) throw new AppError(401, 'User not found');

    // Rotate tokens
    await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    const tokens = generateTokens({ userId: user.id, email: user.email });
    await query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
       VALUES ($1, $2, NOW() + INTERVAL '30 days')`,
      [user.id, tokens.refreshToken]
    );

    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

// POST /auth/logout
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
    }
    res.json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await queryOne<{ id: string; email: string; name: string; avatar: string; created_at: string }>(
      'SELECT id, email, name, avatar, created_at FROM users WHERE id = $1',
      [req.user!.userId]
    );
    if (!user) throw new AppError(404, 'User not found');
    res.json(user);
  } catch (err) {
    next(err);
  }
});

export default router;
