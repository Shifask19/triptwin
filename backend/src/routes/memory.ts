import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import { query, queryOne } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { cacheGet, cacheSet, cacheDel } from '../cache/redis';

const router = Router();
router.use(authenticate);

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(422).json({ errors: errors.array() }); return; }
  next();
};

// GET /memory — all travel memories for current user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const cacheKey = `memory:${userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) { res.json(cached); return; }

    const memories = await query(
      `SELECT tm.*, t.name AS trip_name, t.destination, t.cover_image,
              t.date_start, t.date_end, t.status
       FROM travel_memories tm
       JOIN trips t ON t.id = tm.trip_id
       WHERE tm.user_id = $1
       ORDER BY t.date_start DESC`,
      [userId]
    );

    await cacheSet(cacheKey, memories, 300);
    res.json(memories);
  } catch (err) { next(err); }
});

// POST /memory — create a travel memory after trip completion
router.post(
  '/',
  [
    body('tripId').isUUID(),
    body('satisfactionScore').isInt({ min: 0, max: 100 }),
    body('highlights').isArray(),
    body('skippedItems').isArray(),
    body('totalSpend').isNumeric(),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { tripId, highlights, skippedItems, totalSpend, budgetedSpend, satisfactionScore, photoCount } = req.body as {
        tripId: string; highlights: string[]; skippedItems: string[];
        totalSpend: number; budgetedSpend?: number; satisfactionScore: number; photoCount?: number;
      };

      const trip = await queryOne('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, userId]);
      if (!trip) throw new AppError(404, 'Trip not found');

      const memories = await query<{ id: string }>(
        `INSERT INTO travel_memories
          (user_id, trip_id, highlights, skipped_items, total_spend, budgeted_spend, satisfaction_score, photo_count)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT (trip_id) DO UPDATE SET
          highlights = EXCLUDED.highlights,
          skipped_items = EXCLUDED.skipped_items,
          total_spend = EXCLUDED.total_spend,
          satisfaction_score = EXCLUDED.satisfaction_score,
          photo_count = EXCLUDED.photo_count
         RETURNING id`,
        [userId, tripId, JSON.stringify(highlights), JSON.stringify(skippedItems),
         totalSpend, budgetedSpend ?? null, satisfactionScore, photoCount ?? 0]
      );

      // Mark trip as completed and increment twin trips_completed
      await query('UPDATE trips SET status = $1 WHERE id = $2', ['completed', tripId]);
      await query(
        `UPDATE travel_twins SET
          trips_completed = trips_completed + 1,
          twin_accuracy = LEAST(99, twin_accuracy + 3)
         WHERE user_id = $1`,
        [userId]
      );

      await cacheDel(`memory:${userId}`);
      await cacheDel(`twin:${userId}`);
      res.status(201).json(memories[0]);
    } catch (err) { next(err); }
  }
);

// GET /memory/:tripId — get memory for a specific trip
router.get(
  '/:tripId',
  [param('tripId').isUUID()], validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const memory = await queryOne(
        `SELECT tm.*, t.name AS trip_name, t.destination, t.cover_image, t.date_start, t.date_end
         FROM travel_memories tm
         JOIN trips t ON t.id = tm.trip_id
         WHERE tm.trip_id = $1 AND tm.user_id = $2`,
        [req.params.tripId, req.user!.userId]
      );
      if (!memory) throw new AppError(404, 'Memory not found');
      res.json(memory);
    } catch (err) { next(err); }
  }
);

export default router;
