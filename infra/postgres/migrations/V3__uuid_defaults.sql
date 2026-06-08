CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE users
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE foods
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE daily_logs
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE user_library
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE refresh_tokens
  ALTER COLUMN id SET DEFAULT gen_random_uuid();
