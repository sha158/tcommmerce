-- Make last_name column optional (allow NULL values)
ALTER TABLE users ALTER COLUMN last_name DROP NOT NULL;