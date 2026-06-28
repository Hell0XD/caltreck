ALTER TABLE users
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS height_cm NUMERIC(6, 2),
  ADD COLUMN IF NOT EXISTS activity_level TEXT,
  ADD COLUMN IF NOT EXISTS nutrition_goal TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS app_tour_completed BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
  ADD CONSTRAINT chk_users_height_cm_positive CHECK (height_cm IS NULL OR height_cm > 0);

CREATE TABLE IF NOT EXISTS user_weight_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  measured_on DATE NOT NULL,
  weight_kg NUMERIC(6, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, measured_on),
  CONSTRAINT chk_user_weight_entries_weight_positive CHECK (weight_kg > 0)
);

CREATE INDEX IF NOT EXISTS idx_user_weight_entries_user_measured
  ON user_weight_entries (user_id, measured_on DESC);
