-- Dedicated Community nav flag (separate from Dashboard).
ALTER TABLE access_role
	ADD COLUMN IF NOT EXISTS nav_community boolean NOT NULL DEFAULT false;
