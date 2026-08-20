import { Router, Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
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

// GET /trips/:tripId/activities
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId } = req.params;
    const cacheKey = `activities:${tripId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) { res.json(cached); return; }

    const acts = await query(
      `SELECT * FROM activities WHERE trip_id = $1 ORDER BY activity_date, start_time`,
      [tripId]
    );
    await cacheSet(cacheKey, acts, 60);
    res.json(acts);
  } catch (err) { next(err); }
});

// POST /trips/:tripId/activities
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('type').notEmpty(),
    body('activityDate').isDate(),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId } = req.params;
      const {
        name, type, category, location, lat, lng,
        activityDate, startTime, endTime, durationMin,
        cost, currency, rating, reviewCount, crowdLevel,
        weatherSuitability, image, description,
        personalMatchScore, touristTrapScore,
      } = req.body as Record<string, unknown>;

      const acts = await query<{ id: string }>(
        `INSERT INTO activities
          (trip_id, name, type, category, location, lat, lng, activity_date, start_time,
           end_time, duration_min, cost, currency, rating, review_count, crowd_level,
           weather_suitability, image, description, personal_match_score, tourist_trap_score)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)
         RETURNING id`,
        [tripId, name, type, category ?? null, location ?? null, lat ?? null, lng ?? null,
         activityDate, startTime ?? null, endTime ?? null, durationMin ?? null,
         cost ?? 0, currency ?? 'USD', rating ?? null, reviewCount ?? 0,
         crowdLevel ?? 'medium', weatherSuitability ?? 'both',
         image ?? null, description ?? null,
         personalMatchScore ?? 0, touristTrapScore ?? 0]
      );

      await cacheDel(`activities:${tripId}`);
      await cacheDel(`trip:${tripId}`);
      res.status(201).json(acts[0]);
    } catch (err) { next(err); }
  }
);

// PATCH /trips/:tripId/activities/:activityId — update status or fields
router.patch(
  '/:activityId',
  [param('activityId').isUUID()], validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId, activityId } = req.params;
      const { status, personalMatchScore, touristTrapScore, crowdLevel } = req.body as {
        status?: string; personalMatchScore?: number; touristTrapScore?: number; crowdLevel?: string;
      };

      const existing = await queryOne('SELECT id FROM activities WHERE id = $1 AND trip_id = $2', [activityId, tripId]);
      if (!existing) throw new AppError(404, 'Activity not found');

      await query(
        `UPDATE activities SET
          status = COALESCE($1, status),
          personal_match_score = COALESCE($2, personal_match_score),
          tourist_trap_score = COALESCE($3, tourist_trap_score),
          crowd_level = COALESCE($4, crowd_level)
         WHERE id = $5`,
        [status ?? null, personalMatchScore ?? null, touristTrapScore ?? null, crowdLevel ?? null, activityId]
      );

      await cacheDel(`activities:${tripId}`);
      await cacheDel(`trip:${tripId}`);
      res.json({ message: 'Activity updated' });
    } catch (err) { next(err); }
  }
);

// DELETE /trips/:tripId/activities/:activityId
router.delete(
  '/:activityId',
  [param('activityId').isUUID()], validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tripId, activityId } = req.params;
      const result = await query(
        'DELETE FROM activities WHERE id = $1 AND trip_id = $2 RETURNING id',
        [activityId, tripId]
      );
      if (result.length === 0) throw new AppError(404, 'Activity not found');

      await cacheDel(`activities:${tripId}`);
      await cacheDel(`trip:${tripId}`);
      res.json({ message: 'Activity deleted' });
    } catch (err) { next(err); }
  }
);

export default router;
