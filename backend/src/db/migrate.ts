/**
 * Database migration — creates all tables if they don't exist.
 * Can be run standalone: node dist/db/migrate.js
 * Or imported as a module: await runMigrations()
 */
import { pool } from './pool';

const SQL = `
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email        TEXT UNIQUE NOT NULL,
  password     TEXT NOT NULL,
  name         TEXT NOT NULL,
  avatar       TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS travel_twins (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  trips_completed        INT DEFAULT 0,
  twin_accuracy          INT DEFAULT 0,
  preferences            JSONB NOT NULL DEFAULT '{}',
  spending_profile       JSONB NOT NULL DEFAULT '{}',
  created_at             TIMESTAMPTZ DEFAULT NOW(),
  updated_at             TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trips (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  destination     TEXT NOT NULL,
  country         TEXT NOT NULL,
  cover_image     TEXT,
  date_start      DATE NOT NULL,
  date_end        DATE NOT NULL,
  status          TEXT DEFAULT 'planning' CHECK (status IN ('planning','active','completed')),
  budget          JSONB NOT NULL DEFAULT '{}',
  group_compat    INT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trips_user_id ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_status  ON trips(status);

CREATE TABLE IF NOT EXISTS trip_travelers (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id  UUID REFERENCES trips(id) ON DELETE CASCADE,
  user_id  UUID REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(trip_id, user_id)
);

CREATE TABLE IF NOT EXISTS activities (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id              UUID REFERENCES trips(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  type                 TEXT NOT NULL,
  category             TEXT,
  location             TEXT,
  lat                  NUMERIC(9,6),
  lng                  NUMERIC(9,6),
  activity_date        DATE NOT NULL,
  start_time           TIME,
  end_time             TIME,
  duration_min         INT,
  cost                 NUMERIC(10,2) DEFAULT 0,
  currency             TEXT DEFAULT 'USD',
  rating               NUMERIC(3,1),
  review_count         INT DEFAULT 0,
  crowd_level          TEXT DEFAULT 'medium' CHECK (crowd_level IN ('low','medium','high')),
  weather_suitability  TEXT DEFAULT 'both' CHECK (weather_suitability IN ('indoor','outdoor','both')),
  image                TEXT,
  description          TEXT,
  personal_match_score INT DEFAULT 0,
  tourist_trap_score   INT DEFAULT 0,
  status               TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled','completed','skipped','swapped')),
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_trip_id ON activities(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_date    ON activities(activity_date);

CREATE TABLE IF NOT EXISTS behavior_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
  trip_id      UUID REFERENCES trips(id) ON DELETE CASCADE,
  activity_id  UUID REFERENCES activities(id) ON DELETE SET NULL,
  action       TEXT NOT NULL CHECK (action IN ('completed','skipped','swapped','rated')),
  rating       INT CHECK (rating BETWEEN 1 AND 5),
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_behavior_user_id ON behavior_events(user_id);

CREATE TABLE IF NOT EXISTS travel_memories (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES users(id) ON DELETE CASCADE,
  trip_id            UUID UNIQUE REFERENCES trips(id) ON DELETE CASCADE,
  highlights         JSONB DEFAULT '[]',
  skipped_items      JSONB DEFAULT '[]',
  total_spend        NUMERIC(10,2),
  budgeted_spend     NUMERIC(10,2),
  satisfaction_score INT CHECK (satisfaction_score BETWEEN 0 AND 100),
  photo_count        INT DEFAULT 0,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_memories_user_id ON travel_memories(user_id);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user  ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trips_updated_at') THEN
    CREATE TRIGGER trg_trips_updated_at BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_activities_updated_at') THEN
    CREATE TRIGGER trg_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_twin_updated_at') THEN
    CREATE TRIGGER trg_twin_updated_at BEFORE UPDATE ON travel_twins FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;
`;

export async function runMigrations(): Promise<void> {
  const client = await pool.connect();
  try {
    console.log('[migrate] Running migrations...');
    await client.query(SQL);
    console.log('[migrate] ✓ All tables ready');
  } catch (err) {
    console.error('[migrate] ✗ Failed:', (err as Error).message);
    throw err;
  } finally {
    client.release();
  }
}

// Run standalone when executed directly
if (require.main === module) {
  runMigrations()
    .then(() => pool.end())
    .catch(() => process.exit(1));
}
