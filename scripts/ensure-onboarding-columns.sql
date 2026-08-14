-- Missing columns required by onboarding / settings (safe to re-run).
-- Fixes: GET /onboarding 500 when schema lagged behind the app image.

ALTER TABLE facility
	ADD COLUMN IF NOT EXISTS show_on_onboarding boolean NOT NULL DEFAULT false;

ALTER TABLE newsletter
	ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;

-- Prefer created_at order when sort_order was just added (all zeros).
WITH ranked AS (
	SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) AS rn
	FROM newsletter
)
UPDATE newsletter n
SET sort_order = ranked.rn
FROM ranked
WHERE n.id = ranked.id
	AND NOT EXISTS (
		SELECT 1 FROM newsletter WHERE sort_order <> 0 LIMIT 1
	);
