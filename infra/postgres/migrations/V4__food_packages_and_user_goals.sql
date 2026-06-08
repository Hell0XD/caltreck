ALTER TABLE foods
  ADD COLUMN IF NOT EXISTS package_quantity NUMERIC(10, 2),
  ADD COLUMN IF NOT EXISTS package_unit TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS calorie_goal NUMERIC(10, 2) NOT NULL DEFAULT 2000,
  ADD COLUMN IF NOT EXISTS protein_goal NUMERIC(10, 2) NOT NULL DEFAULT 150,
  ADD COLUMN IF NOT EXISTS carbs_goal NUMERIC(10, 2) NOT NULL DEFAULT 250,
  ADD COLUMN IF NOT EXISTS fat_goal NUMERIC(10, 2) NOT NULL DEFAULT 70;

ALTER TABLE users
  ADD CONSTRAINT chk_users_calorie_goal_positive CHECK (calorie_goal > 0),
  ADD CONSTRAINT chk_users_protein_goal_non_negative CHECK (protein_goal >= 0),
  ADD CONSTRAINT chk_users_carbs_goal_non_negative CHECK (carbs_goal >= 0),
  ADD CONSTRAINT chk_users_fat_goal_non_negative CHECK (fat_goal >= 0);
