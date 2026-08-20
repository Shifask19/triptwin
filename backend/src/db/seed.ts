import bcrypt from 'bcryptjs';
import { pool, query } from './pool';

export async function runSeed(): Promise<void> {
  console.log('[seed] Seeding demo data...');

  const hash = await bcrypt.hash('demo1234', 12);
  const users = await query<{ id: string }>(
    `INSERT INTO users (email, password, name, avatar)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
     RETURNING id`,
    ['demo@triptwin.com', hash, 'Alex Chen', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex']
  );
  const userId = users[0].id;
  console.log('[seed] ✓ User:', userId);

  await query(
    `INSERT INTO travel_twins (user_id, trips_completed, twin_accuracy, preferences, spending_profile)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id) DO UPDATE SET preferences = EXCLUDED.preferences`,
    [userId, 7, 84,
      JSON.stringify({
        budgetLevel: 'mid-range', luxuryVsBudget: 35, adventureVsRelax: 60,
        natureVsCity: 55, museumInterest: 45, foodInterest: 92, shoppingInterest: 38,
        photographyInterest: 78, nightlifeInterest: 30, walkingTolerance: 72,
        crowdTolerance: 28, hiddenGemsVsLandmarks: 75, pace: 'moderate',
        travelStyle: 'couple', vegetarian: false,
        preferredTransport: ['metro', 'walking', 'bike'], preferredTravelTime: 'morning',
      }),
      JSON.stringify({ avgPerActivity: 22, avgPerMeal: 18, avgDailyBudget: 120, spendingConsistency: 71 }),
    ]
  );
  console.log('[seed] ✓ Travel Twin created');

  const trips = await query<{ id: string }>(
    `INSERT INTO trips (user_id, name, destination, country, cover_image, date_start, date_end, status, budget)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     ON CONFLICT DO NOTHING RETURNING id`,
    [userId, 'Tokyo Adventure', 'Tokyo, Japan', 'Japan',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=80',
      '2026-08-18', '2026-08-24', 'active',
      JSON.stringify({
        total: 2400, accommodation: 720, food: 480, transport: 220, activities: 560, shopping: 200,
        spent: { accommodation: 720, food: 210, transport: 88, activities: 195, shopping: 65 },
      }),
    ]
  );

  if (trips.length > 0) {
    const tripId = trips[0].id;
    const acts = [
      ['Omoide Yokocho', 'food', 'Street Food', 'Shinjuku, Tokyo', '2026-08-18', '18:30', '20:30', 120, 25, 4.6, 8920, 'high', 'outdoor', 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80', 'Narrow alley of yakitori bars.', 96, 28, 'completed'],
      ['Tsukiji Outer Market', 'food', 'Local Market', 'Tsukiji, Tokyo', '2026-08-19', '08:00', '10:30', 150, 30, 4.7, 15420, 'medium', 'outdoor', 'https://images.unsplash.com/photo-1624561172888-ac93c696e10c?w=600&q=80', 'World-famous fish market.', 94, 35, 'completed'],
      ['teamLab Borderless', 'culture', 'Digital Art', 'Odaiba, Tokyo', '2026-08-19', '13:00', '16:00', 180, 32, 4.8, 22100, 'high', 'indoor', 'https://images.unsplash.com/photo-1518998053901-5348d3961a04?w=600&q=80', 'Immersive digital art museum.', 82, 55, 'scheduled'],
      ['Yanaka Ginza', 'culture', 'Local Neighborhood', 'Yanaka, Tokyo', '2026-08-20', '09:30', '12:00', 150, 0, 4.6, 5480, 'low', 'outdoor', 'https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&q=80', 'Old Tokyo neighborhood.', 97, 8, 'scheduled'],
    ];
    for (const [name, type, cat, loc, date, start, end, dur, cost, rating, reviews, crowd, weather, img, desc, match, trap, status] of acts) {
      await query(
        `INSERT INTO activities
          (trip_id, name, type, category, location, activity_date, start_time, end_time,
           duration_min, cost, rating, review_count, crowd_level, weather_suitability,
           image, description, personal_match_score, tourist_trap_score, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
         ON CONFLICT DO NOTHING`,
        [tripId, name, type, cat, loc, date, start, end, dur, cost, rating, reviews, crowd, weather, img, desc, match, trap, status]
      );
    }
    console.log('[seed] ✓ Trip and activities seeded');
  }

  console.log('[seed] ✓ Done! Login: demo@triptwin.com / demo1234');
}

// Run standalone
if (require.main === module) {
  runSeed()
    .then(() => pool.end())
    .catch(e => { console.error(e); process.exit(1); });
}
