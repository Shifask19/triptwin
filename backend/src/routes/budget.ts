import { Router, Request, Response, NextFunction } from 'express';
import { param, validationResult } from 'express-validator';
import { query, queryOne } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { cacheDel, cacheGet, cacheSet } from '../cache/redis';

const router = Router({ mergeParams: true });
router.use(authenticate);

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(422).json({ errors: errors.array() }); return; }
  next();
};

// GET /trips/:tripId/budget — get full budget state
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId } = req.params;
    const cacheKey = `budget:${tripId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) { res.json(cached); return; }

    const trip = await queryOne<{ budget: Record<string, unknown>; date_start: string; date_end: string }>(
      'SELECT budget, date_start, date_end FROM trips WHERE id = $1 AND user_id = $2',
      [tripId, req.user!.userId]
    );
    if (!trip) throw new AppError(404, 'Trip not found');

    // Compute actual spend from activities
    const actSpend = await query<{ type: string; total: string }>(
      `SELECT type,
        SUM(cost) AS total
       FROM activities
       WHERE trip_id = $1 AND status = 'completed'
       GROUP BY type`,
      [tripId]
    );

    const budget = trip.budget;
    const spentByType: Record<string, number> = {};
    for (const row of actSpend) {
      spentByType[row.type] = parseFloat(row.total);
    }

    // Trip duration for daily calc
    const start = new Date(trip.date_start);
    const end = new Date(trip.date_end);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86400000));
    const today = new Date();
    const daysSoFar = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / 86400000));

    const totalSpent = Object.values(spentByType).reduce((a, b) => a + b, 0);
    const totalBudget = Number(budget.total ?? 0);
    const remaining = totalBudget - totalSpent;
    const dailyBudget = totalBudget / totalDays;
    const expectedSpent = dailyBudget * daysSoFar;
    const variancePct = totalBudget > 0 ? Math.round(((totalSpent - expectedSpent) / totalBudget) * 100) : 0;

    const result = {
      budget,
      computed: {
        totalSpent,
        remaining,
        spentPct: totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0,
        dailyBudget: Math.round(dailyBudget),
        daysSoFar,
        totalDays,
        variancePct,
        isOverspending: variancePct > 10,
        spentByType,
      },
    };

    await cacheSet(cacheKey, result, 30);
    res.json(result);
  } catch (err) { next(err); }
});

// PATCH /trips/:tripId/budget — update budget allocations
router.patch('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId } = req.params;
    const existing = await queryOne('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [tripId, req.user!.userId]);
    if (!existing) throw new AppError(404, 'Trip not found');

    await query(
      `UPDATE trips SET budget = budget || $1::jsonb WHERE id = $2`,
      [JSON.stringify(req.body), tripId]
    );
    await cacheDel(`budget:${tripId}`);
    await cacheDel(`trip:${tripId}`);
    res.json({ message: 'Budget updated' });
  } catch (err) { next(err); }
});

export default router;
