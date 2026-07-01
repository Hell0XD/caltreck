ALTER TABLE users
  ADD COLUMN IF NOT EXISTS unit_system TEXT NOT NULL DEFAULT 'metric';

ALTER TABLE users
  ADD CONSTRAINT chk_users_unit_system CHECK (unit_system IN ('metric', 'imperial'));
