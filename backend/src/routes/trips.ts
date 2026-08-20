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

// GET /trips — list all trips for current user
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const cacheKey = `trips:${userId}`;
    const cached = await cacheGet(cacheKey);
    if (cached) { res.json(cached); return; }

    const trips = await query(
      `SELECT t.*, 
        json_agg(DISTINCT jsonb_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar)) AS travelers
       FROM trips t
       JOIN trip_travelers tt ON tt.trip_id = t.id
       JOIN users u ON u.id = tt.user_id
       WHERE t.user_id = $1
       GROUP BY t.id
       ORDER BY t.date_start DESC`,
      [userId]
    );

    await cacheSet(cacheKey, trips, 60);
    res.json(trips);
  } catch (err) { next(err); }
});

// POST /trips — create a new trip
router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('destination').trim().notEmpty(),
    body('country').trim().notEmpty(),
    body('dateStart').isDate(),
    body('dateEnd').isDate(),
    body('budget').isObject(),
  ],
  validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { name, destination, country, coverImage, dateStart, dateEnd, budget, groupCompatibility } = req.body as {
        name: string; destination: string; country: string; coverImage?: string;
        dateStart: string; dateEnd: string; budget: object; groupCompatibility?: number;
      };

      const trips = await query<{ id: string }>(
        `INSERT INTO trips (user_id, name, destination, country, cover_image, date_start, date_end, budget, group_compat)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
        [userId, name, destination, country, coverImage ?? null, dateStart, dateEnd, JSON.stringify(budget), groupCompatibility ?? null]
      );
      const trip = trips[0];

      // Add creator as traveler
      await query(
        'INSERT INTO trip_travelers (trip_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING',
        [trip.id, userId]
      );

      await cacheDel(`trips:${userId}`);
      res.status(201).json(trip);
    } catch (err) { next(err); }
  }
);

// GET /trips/:id
router.get(
  '/:id',
  [param('id').isUUID()], validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cacheKey = `trip:${req.params.id}`;
      const cached = await cacheGet(cacheKey);
      if (cached) { res.json(cached); return; }

      const trip = await queryOne(
        `SELECT t.*,
          json_agg(DISTINCT jsonb_build_object('id', u.id, 'name', u.name, 'avatar', u.avatar)) AS travelers,
          json_agg(DISTINCT jsonb_build_object(
            'id', a.id, 'name', a.name, 'type', a.type, 'category', a.category,
            'location', a.location, 'activityDate', a.activity_date,
            'startTime', a.start_time, 'endTime', a.end_time,
            'durationMin', a.duration_min, 'cost', a.cost, 'status', a.status,
            'personalMatchScore', a.personal_match_score, 'touristTrapScore', a.tourist_trap_score,
            'crowdLevel', a.crowd_level, 'weatherSuitability', a.weather_suitability,
            'rating', a.rating, 'image', a.image, 'description', a.description
          ) ORDER BY a.activity_date, a.start_time) FILTER (WHERE a.id IS NOT NULL) AS activities
         FROM trips t
         JOIN trip_travelers tt ON tt.trip_id = t.id
         JOIN users u ON u.id = tt.user_id
         LEFT JOIN activities a ON a.trip_id = t.id
         WHERE t.id = $1
         GROUP BY t.id`,
        [req.params.id]
      );

      if (!trip) throw new AppError(404, 'Trip not found');
      await cacheSet(cacheKey, trip, 120);
      res.json(trip);
    } catch (err) { next(err); }
  }
);

// PATCH /trips/:id
router.patch(
  '/:id',
  [param('id').isUUID()], validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const { name, status, budget, coverImage } = req.body as {
        name?: string; status?: string; budget?: object; coverImage?: string;
      };

      const existing = await queryOne('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
      if (!existing) throw new AppError(404, 'Trip not found');

      await query(
        `UPDATE trips SET
          name = COALESCE($1, name),
          status = COALESCE($2, status),
          budget = COALESCE($3, budget),
          cover_image = COALESCE($4, cover_image)
         WHERE id = $5`,
        [name ?? null, status ?? null, budget ? JSON.stringify(budget) : null, coverImage ?? null, req.params.id]
      );

      await cacheDel(`trip:${req.params.id}`);
      await cacheDel(`trips:${userId}`);
      res.json({ message: 'Trip updated' });
    } catch (err) { next(err); }
  }
);

// DELETE /trips/:id
router.delete(
  '/:id',
  [param('id').isUUID()], validate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.userId;
      const result = await query('DELETE FROM trips WHERE id = $1 AND user_id = $2 RETURNING id', [req.params.id, userId]);
      if (result.length === 0) throw new AppError(404, 'Trip not found');

      await cacheDel(`trip:${req.params.id}`);
      await cacheDel(`trips:${userId}`);
      res.json({ message: 'Trip deleted' });
    } catch (err) { next(err); }
  }
);

export default router;
