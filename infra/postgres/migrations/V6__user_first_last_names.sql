ALTER TABLE users
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

UPDATE users
SET
  first_name = COALESCE(
    NULLIF(split_part(trim(display_name), ' ', 1), ''),
    NULLIF(split_part(email, '@', 1), ''),
    'User'
  ),
  last_name = COALESCE(
    NULLIF(
      CASE
        WHEN position(' ' IN trim(display_name)) > 0
          THEN trim(substring(trim(display_name) FROM position(' ' IN trim(display_name)) + 1))
        ELSE ''
      END,
      ''
    ),
    ''
  )
WHERE first_name IS NULL
   OR last_name IS NULL;

ALTER TABLE users
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL,
  ALTER COLUMN first_name SET DEFAULT '',
  ALTER COLUMN last_name SET DEFAULT '';

ALTER TABLE users
  DROP COLUMN IF EXISTS display_name;
