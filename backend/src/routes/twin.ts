import { Router, Request, Response, NextFunction } from 'express';
import { query, queryOne } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { cacheGet, cacheSet, cacheDel } from '../cache/redis';
import { AI } from '../ai/provider';
import type { TwinContext } from '../ai/provider';

const router = Router();
router.use(authenticate);

function buildTwinContext(twin: Record<string, unknown>): TwinContext {
  const prefs = (twin.preferences as Record<string, unknown>) ?? {};
  const spending = (twin.spending_profile as Record<string, unknown>) ?? {};
  return {
    name: 'Traveler',
    budgetLevel: String(prefs.budgetLevel ?? 'mid-range'),
    topInterests: [
      ...(Number(prefs.foodInterest ?? 0) > 70 ? ['food'] : []),
      ...(Number(prefs.photographyInterest ?? 0) > 70 ? ['photography'] : []),
      ...(Number(prefs.museumInterest ?? 0) > 70 ? ['culture'] : []),
      ...(Number(prefs.adventureVsRelax ?? 50) > 70 ? ['adventure'] : []),
    ],
    crowdTolerance: Number(prefs.crowdTolerance ?? 50),
    hiddenGemsVsLandmarks: Number(prefs.hiddenGemsVsLandmarks ?? 50),
    adventureVsRelax: Number(prefs.adventureVsRelax ?? 50),
    avgPerActivity: Number(spending.avgPerActivity ?? 25),
    pastHighlights: [],
    pastSkipped: [],
  };
}

// GET /twin — get current user's Travel Twin
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const cacheKey = `twin:${userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) { res.json(cached); return; }

    let twin = await queryOne(
      `SELECT t.*, u.name, u.avatar
       FROM travel_twins t
       JOIN users u ON u.id = t.user_id
       WHERE t.user_id = $1`,
      [userId]
    );

    if (!twin) {
      // Auto-create if missing
      await query(
        `INSERT INTO travel_twins (user_id, preferences, spending_profile)
         VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [userId, JSON.stringify({}), JSON.stringify({})]
      );
      twin = await queryOne(`SELECT * FROM travel_twins WHERE user_id = $1`, [userId]);
    }

    await cacheSet(cacheKey, twin, 120);
    res.json(twin);
  } catch (err) { next(err); }
});

// PATCH /twin/preferences — update learned preferences
router.patch('/preferences', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await query(
      `UPDATE travel_twins
       SET preferences = preferences || $1::jsonb
       WHERE user_id = $2`,
      [JSON.stringify(req.body), userId]
    );
    await cacheDel(`twin:${userId}`);
    res.json({ message: 'Preferences updated' });
  } catch (err) { next(err); }
});

// PATCH /twin/spending — update spending profile
router.patch('/spending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await query(
      `UPDATE travel_twins
       SET spending_profile = spending_profile || $1::jsonb
       WHERE user_id = $2`,
      [JSON.stringify(req.body), userId]
    );
    await cacheDel(`twin:${userId}`);
    res.json({ message: 'Spending profile updated' });
  } catch (err) { next(err); }
});

// POST /twin/behavior — log a behavior event (activity completed, skipped, etc.)
router.post('/behavior', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { tripId, activityId, action, rating, notes } = req.body as {
      tripId: string; activityId: string; action: string; rating?: number; notes?: string;
    };

    await query(
      `INSERT INTO behavior_events (user_id, trip_id, activity_id, action, rating, notes)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [userId, tripId, activityId, action, rating ?? null, notes ?? null]
    );

    // Bump accuracy slightly (real system would use ML pipeline)
    await query(
      `UPDATE travel_twins
       SET twin_accuracy = LEAST(99, twin_accuracy + 1)
       WHERE user_id = $1`,
      [userId]
    );

    await cacheDel(`twin:${userId}`);
    res.status(201).json({ message: 'Behavior recorded' });
  } catch (err) { next(err); }
});

// GET /twin/behavior — get behavior history
router.get('/behavior', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const events = await query(
      `SELECT be.*, a.name AS activity_name, t.destination
       FROM behavior_events be
       LEFT JOIN activities a ON a.id = be.activity_id
       LEFT JOIN trips t ON t.id = be.trip_id
       WHERE be.user_id = $1
       ORDER BY be.created_at DESC
       LIMIT 100`,
      [userId]
    );
    res.json(events);
  } catch (err) { next(err); }
});

// POST /twin/recommend — AI-powered recommendation for the user
router.post('/recommend', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { context } = req.body as { context: string };

    const twin = await queryOne<Record<string, unknown>>(
      `SELECT preferences, spending_profile FROM travel_twins WHERE user_id = $1`,
      [userId]
    );
    if (!twin) throw new AppError(404, 'Travel Twin not found');

    const twinCtx = buildTwinContext(twin);
    const recommendation = await AI.getRecommendation(twinCtx, context ?? 'Current location and time');

    res.json(recommendation);
  } catch (err) { next(err); }
});

export default router;
