CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL,
  calorie_goal NUMERIC(10, 2) NOT NULL,
  protein_goal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  carbs_goal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  fat_goal NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, effective_from),
  CONSTRAINT chk_user_goals_calorie_goal_positive CHECK (calorie_goal > 0),
  CONSTRAINT chk_user_goals_protein_goal_non_negative CHECK (protein_goal >= 0),
  CONSTRAINT chk_user_goals_carbs_goal_non_negative CHECK (carbs_goal >= 0),
  CONSTRAINT chk_user_goals_fat_goal_non_negative CHECK (fat_goal >= 0)
);

INSERT INTO user_goals (
  user_id,
  effective_from,
  calorie_goal,
  protein_goal,
  carbs_goal,
  fat_goal,
  created_at,
  updated_at
)
SELECT
  id,
  created_at::date,
  calorie_goal,
  protein_goal,
  carbs_goal,
  fat_goal,
  created_at,
  updated_at
FROM users
ON CONFLICT (user_id, effective_from) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_user_goals_user_effective
  ON user_goals (user_id, effective_from DESC);

ALTER TABLE users
  DROP CONSTRAINT IF EXISTS chk_users_calorie_goal_positive,
  DROP CONSTRAINT IF EXISTS chk_users_protein_goal_non_negative,
  DROP CONSTRAINT IF EXISTS chk_users_carbs_goal_non_negative,
  DROP CONSTRAINT IF EXISTS chk_users_fat_goal_non_negative;

ALTER TABLE users
  DROP COLUMN IF EXISTS calorie_goal,
  DROP COLUMN IF EXISTS protein_goal,
  DROP COLUMN IF EXISTS carbs_goal,
  DROP COLUMN IF EXISTS fat_goal;
