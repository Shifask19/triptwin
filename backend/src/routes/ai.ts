/**
 * AI-powered endpoints — all backed by the AI provider abstraction.
 * Separate rate limit applied (see app.ts).
 */
import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { queryOne, query } from '../db/pool';
import { authenticate } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { cacheGet, cacheSet } from '../cache/redis';
import { AI } from '../ai/provider';
import type { TwinContext } from '../ai/provider';

const router = Router();
router.use(authenticate);

const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) { res.status(422).json({ errors: errors.array() }); return; }
  next();
};

async function getTwinContext(userId: string): Promise<TwinContext> {
  const twin = await queryOne<Record<string, unknown>>(
    `SELECT t.preferences, t.spending_profile, u.name,
      (SELECT json_agg(highlight) FROM travel_memories tm,
        jsonb_array_elements_text(tm.highlights) AS highlight
        WHERE tm.user_id = t.user_id LIMIT 10) AS highlights,
      (SELECT json_agg(sk) FROM travel_memories tm,
        jsonb_array_elements_text(tm.skipped_items) AS sk
        WHERE tm.user_id = t.user_id LIMIT 10) AS skipped
     FROM travel_twins t
     JOIN users u ON u.id = t.user_id
     WHERE t.user_id = $1`,
    [userId]
  );

  if (!twin) throw new AppError(404, 'Travel Twin not found');

  const prefs = (twin.preferences as Record<string, unknown>) ?? {};
  const spending = (twin.spending_profile as Record<string, unknown>) ?? {};

  return {
    name: String(twin.name ?? 'Traveler'),
    budgetLevel: String(prefs.budgetLevel ?? 'mid-range'),
    topInterests: [
      ...(Number(prefs.foodInterest ?? 0) > 70 ? ['food'] : []),
      ...(Number(prefs.photographyInterest ?? 0) > 70 ? ['photography'] : []),
      ...(Number(prefs.museumInterest ?? 0) > 70 ? ['culture'] : []),
      ...(Number(prefs.adventureVsRelax ?? 50) > 70 ? ['adventure'] : []),
      ...(Number(prefs.nightlifeInterest ?? 0) > 70 ? ['nightlife'] : []),
    ],
    crowdTolerance: Number(prefs.crowdTolerance ?? 50),
    hiddenGemsVsLandmarks: Number(prefs.hiddenGemsVsLandmarks ?? 50),
    adventureVsRelax: Number(prefs.adventureVsRelax ?? 50),
    avgPerActivity: Number(spending.avgPerActivity ?? 25),
    pastHighlights: (twin.highlights as string[]) ?? [],
    pastSkipped: (twin.skipped as string[]) ?? [],
  };
}

// POST /ai/recommend — personalised recommendation
router.post(
  '/recommend',
  [body('context').notEmpty()],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const twinCtx = await getTwinContext(req.user!.userId);
      const result = await AI.getRecommendation(twinCtx, req.body.context as string);
      res.json({ provider: process.env.AI_PROVIDER ?? 'mock', result });
    } catch (err) { next(err); }
  }
);

// POST /ai/trap-analysis — tourist trap analysis for an activity
router.post(
  '/trap-analysis',
  [body('activityName').notEmpty(), body('cost').isNumeric()],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activityName, cost, rating, crowdLevel } = req.body as {
        activityName: string; cost: number; rating?: number; crowdLevel?: string;
      };
      const cacheKey = `trap:${activityName}:${cost}`;
      const cached = await cacheGet(cacheKey);
      if (cached) { res.json(cached); return; }

      const twinCtx = await getTwinContext(req.user!.userId);
      const result = await AI.analyzeTrap(activityName, cost, rating ?? 4.0, crowdLevel ?? 'medium', twinCtx);

      await cacheSet(cacheKey, result, 300);
      res.json({ provider: process.env.AI_PROVIDER ?? 'mock', result });
    } catch (err) { next(err); }
  }
);

// POST /ai/search — intent-based experience search
router.post(
  '/search',
  [body('query').trim().notEmpty()],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query: searchQuery } = req.body as { query: string };
      const cacheKey = `search:${req.user!.userId}:${searchQuery.toLowerCase().slice(0, 50)}`;
      const cached = await cacheGet(cacheKey);
      if (cached) { res.json(cached); return; }

      const twinCtx = await getTwinContext(req.user!.userId);
      const result = await AI.intentSearch(searchQuery, twinCtx);

      await cacheSet(cacheKey, result, 120);
      res.json({ provider: process.env.AI_PROVIDER ?? 'mock', query: searchQuery, result });
    } catch (err) { next(err); }
  }
);

// POST /ai/tripswap — evaluate whether to swap an activity
router.post(
  '/tripswap',
  [body('activityId').isUUID(), body('signals').isArray()],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activityId, signals } = req.body as { activityId: string; signals: string[] };

      const activity = await queryOne<{ name: string }>(
        'SELECT name FROM activities WHERE id = $1',
        [activityId]
      );
      if (!activity) throw new AppError(404, 'Activity not found');

      const twinCtx = await getTwinContext(req.user!.userId);
      const result = await AI.suggestSwap(activity.name, signals, twinCtx);

      // If AI says swap, update activity status
      if (result.shouldSwap) {
        await query(
          `UPDATE activities SET status = 'swapped' WHERE id = $1`,
          [activityId]
        );
      }

      res.json({ provider: process.env.AI_PROVIDER ?? 'mock', activityName: activity.name, result });
    } catch (err) { next(err); }
  }
);

// POST /ai/what-now — real-time "what should I do now" recommendations
router.post(
  '/what-now',
  [body('availableMinutes').isNumeric()],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { availableMinutes, currentLocation, weather, budget } = req.body as {
        availableMinutes: number;
        currentLocation?: string;
        weather?: string;
        budget?: number;
      };

      const twinCtx = await getTwinContext(req.user!.userId);
      const context = `Available time: ${availableMinutes} minutes. Location: ${currentLocation ?? 'unknown'}. Weather: ${weather ?? 'clear'}. Remaining budget: $${budget ?? twinCtx.avgPerActivity}.`;

      const [bestMatch, bestValue, hiddenGem] = await Promise.all([
        AI.getRecommendation(twinCtx, `BEST MATCH for traveler. ${context}`),
        AI.getRecommendation(twinCtx, `BEST VALUE (lowest cost, good quality). ${context}`),
        AI.getRecommendation(twinCtx, `HIDDEN GEM (off the tourist trail, local experience). ${context}`),
      ]);

      res.json({
        provider: process.env.AI_PROVIDER ?? 'mock',
        context: { availableMinutes, currentLocation, weather },
        recommendations: {
          bestMatch: { type: 'best-match', ...bestMatch },
          bestValue: { type: 'best-value', ...bestValue },
          hiddenGem: { type: 'hidden-gem', ...hiddenGem },
        },
      });
    } catch (err) { next(err); }
  }
);

export default router;
