-- Add table export permission flags for employees, pharmacy, and doctors.
-- Safe to re-run: uses IF NOT EXISTS.

ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "employee_export" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "pharmacy_export" boolean DEFAULT false NOT NULL;
ALTER TABLE "access_role" ADD COLUMN IF NOT EXISTS "doctor_export" boolean DEFAULT false NOT NULL;

-- Backfill: roles that already have Excel override can export by default.
UPDATE "access_role"
SET "employee_export" = true
WHERE "employee_excel_override" = true AND "employee_export" = false;

UPDATE "access_role"
SET "pharmacy_export" = true
WHERE "pharmacy_excel_override" = true AND "pharmacy_export" = false;

UPDATE "access_role"
SET "doctor_export" = true
WHERE "doctor_excel_override" = true AND "doctor_export" = false;
