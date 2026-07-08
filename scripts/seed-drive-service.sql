-- Register PHH-DRIVE in employee portal services (run against portal DATABASE_URL).
-- Prefer automatic sync: set DRIVE_ORIGIN in .env and restart the portal (ensureBuiltinServices).
-- This script is for manual/initial seed only — link must match DRIVE_ORIGIN / drive ORIGIN.

INSERT INTO service (id, name, description, category, link, embed_mode, is_public, created_at, updated_at)
SELECT
	'f47ac10b-58cc-4372-a567-0e02b2c3d479',
	'PHH-DRIVE',
	'Team file storage and sharing',
	'Productivity',
	'REPLACE_WITH_DRIVE_ORIGIN',
	'external',
	false,
	NOW(),
	NOW()
WHERE NOT EXISTS (SELECT 1 FROM service WHERE id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479');

-- Grant all access roles access to PHH-DRIVE (optional — tighten per role in admin UI):
INSERT INTO access_role_service (id, role_id, service_id, created_at)
SELECT gen_random_uuid(), ar.id, s.id, NOW()
FROM access_role ar
CROSS JOIN service s
WHERE s.id = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
  AND NOT EXISTS (
    SELECT 1 FROM access_role_service ars
    WHERE ars.role_id = ar.id AND ars.service_id = s.id
  );
