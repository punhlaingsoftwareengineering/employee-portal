-- Create onboarding carousel speed config (singleton row).
-- Safe to run multiple times.

CREATE TABLE IF NOT EXISTS onboarding_carousel_config (
	id text PRIMARY KEY NOT NULL,
	interval_ms integer NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO onboarding_carousel_config (id, interval_ms)
VALUES ('default', 5000)
ON CONFLICT (id) DO NOTHING;
