-- Migrate access_role from coarse *Write flags to per-action permissions.
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS.

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "nav_users" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "nav_roles" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "employee_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "employee_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "employee_excel_override" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "department_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "department_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "department_delete" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "facility_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "facility_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "facility_delete" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "pharmacy_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "pharmacy_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "pharmacy_delete" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "pharmacy_excel_override" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "doctor_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "doctor_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "doctor_excel_override" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "users_read" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "users_invite" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "users_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "users_invite_resend" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "users_invite_revoke" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "roles_read" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "roles_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "roles_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "roles_delete" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "community_category_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "community_category_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "community_category_delete" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "community_link_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "community_link_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "community_link_delete" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_theme_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_newsletter_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_newsletter_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_newsletter_delete" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_onboarding_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_onboarding_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_onboarding_delete" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_announcement_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_announcement_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_announcement_delete" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_sound_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_sound_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_sound_delete" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_notification_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_notification_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "settings_notification_delete" boolean DEFAULT false NOT NULL;

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_service_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_service_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_service_delete" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_app_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_app_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_app_delete" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_guide_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_guide_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_guide_delete" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_learning_create" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_learning_update" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "tools_learning_delete" boolean DEFAULT false NOT NULL;

-- Backfill from legacy *Write columns when present
DO $$
BEGIN
	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'access_role' AND column_name = 'employee_write'
	) THEN
		UPDATE "access_role" SET
			"employee_create" = "employee_write",
			"employee_update" = "employee_write",
			"employee_excel_override" = "employee_write";
	END IF;

	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'access_role' AND column_name = 'doctor_write'
	) THEN
		UPDATE "access_role" SET
			"doctor_create" = "doctor_write",
			"doctor_update" = "doctor_write",
			"doctor_excel_override" = "doctor_write";
	END IF;

	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'access_role' AND column_name = 'pharmacy_write'
	) THEN
		UPDATE "access_role" SET
			"pharmacy_create" = "pharmacy_write",
			"pharmacy_update" = "pharmacy_write",
			"pharmacy_excel_override" = "pharmacy_write",
			"pharmacy_delete" = "pharmacy_write";
	END IF;

	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'access_role' AND column_name = 'department_write'
	) THEN
		UPDATE "access_role" SET
			"department_update" = "department_write",
			"department_delete" = "department_write";
	END IF;

	IF EXISTS (
		SELECT 1 FROM information_schema.columns
		WHERE table_name = 'access_role' AND column_name = 'facility_write'
	) THEN
		UPDATE "access_role" SET
			"facility_update" = "facility_write",
			"facility_delete" = "facility_write";
	END IF;
END $$;

ALTER TABLE "access_role" DROP COLUMN IF EXISTS "employee_write";
ALTER TABLE "access_role" DROP COLUMN IF EXISTS "doctor_write";
ALTER TABLE "access_role" DROP COLUMN IF EXISTS "pharmacy_write";
ALTER TABLE "access_role" DROP COLUMN IF EXISTS "department_write";
ALTER TABLE "access_role" DROP COLUMN IF EXISTS "facility_write";
