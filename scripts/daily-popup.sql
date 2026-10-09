-- Daily onboarding popup tables + permission columns.
-- Safe to re-run.

DO $$ BEGIN
	CREATE TYPE daily_popup_schedule_kind AS ENUM ('weekday', 'date');
EXCEPTION
	WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS daily_popup_config (
	id text PRIMARY KEY NOT NULL,
	dismiss_cooldown_minutes integer NOT NULL,
	carousel_interval_ms integer NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL
);

INSERT INTO daily_popup_config (id, dismiss_cooldown_minutes, carousel_interval_ms)
VALUES ('default', 15, 5000)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS daily_popup_schedule (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	kind daily_popup_schedule_kind NOT NULL,
	weekday integer,
	calendar_date date,
	enabled boolean DEFAULT true NOT NULL,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS daily_popup_schedule_weekday_uidx
	ON daily_popup_schedule (weekday)
	WHERE kind = 'weekday' AND weekday IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS daily_popup_schedule_date_uidx
	ON daily_popup_schedule (calendar_date)
	WHERE kind = 'date' AND calendar_date IS NOT NULL;

CREATE TABLE IF NOT EXISTS daily_popup_image (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	schedule_id uuid NOT NULL REFERENCES daily_popup_schedule(id) ON DELETE CASCADE,
	image_url text NOT NULL,
	drive_file_id text,
	link_url text,
	sort_order integer DEFAULT 0 NOT NULL,
	created_at timestamp with time zone DEFAULT now() NOT NULL,
	updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS daily_popup_image_schedule_sort_idx
	ON daily_popup_image (schedule_id, sort_order, created_at);

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_daily_popup_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_daily_popup_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_daily_popup_delete" boolean DEFAULT false NOT NULL;
