CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT,
  barcode TEXT,
  source TEXT NOT NULL,
  source_id TEXT,
  locale TEXT,
  serving_size NUMERIC(10, 2),
  serving_unit TEXT,
  calories_per_100g NUMERIC(10, 2),
  protein_per_100g NUMERIC(10, 2),
  carbs_per_100g NUMERIC(10, 2),
  fat_per_100g NUMERIC(10, 2),
  fiber_per_100g NUMERIC(10, 2),
  sugar_per_100g NUMERIC(10, 2),
  salt_per_100g NUMERIC(10, 2),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_foods_name_trgm ON foods USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods (barcode);
CREATE UNIQUE INDEX IF NOT EXISTS idx_foods_source_source_id
  ON foods (source, source_id)
  WHERE source_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id),
  log_date DATE NOT NULL,
  meal_type TEXT NOT NULL,
  quantity NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL,
  calories NUMERIC(10, 2) NOT NULL,
  protein NUMERIC(10, 2) NOT NULL DEFAULT 0,
  carbs NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fat NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs (user_id, log_date);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_meal_date ON daily_logs (user_id, meal_type, log_date);

CREATE TABLE IF NOT EXISTS user_library (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  food_id UUID NOT NULL REFERENCES foods(id) ON DELETE CASCADE,
  label TEXT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  default_quantity NUMERIC(10, 2),
  default_unit TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, food_id)
);

CREATE INDEX IF NOT EXISTS idx_user_library_user ON user_library (user_id);
CREATE INDEX IF NOT EXISTS idx_user_library_favorites ON user_library (user_id, is_favorite);
