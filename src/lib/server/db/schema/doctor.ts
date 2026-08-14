import { bigint, boolean, integer, pgTable, text } from 'drizzle-orm/pg-core';

/** Doctor master — aligned with HIS doctor list (only `id` is required). */
export const doctor = pgTable('doctor', {
	id: bigint('id', { mode: 'number' }).primaryKey().generatedByDefaultAsIdentity(),
	hisid: integer('hisid'),
	facilityName: text('facility_name'),
	drnno: text('drnno'),
	doctorName: text('doctor_name'),
	specialization: text('specialization'),
	active: boolean('active').default(true)
});

export type Doctor = typeof doctor.$inferSelect;
export type NewDoctor = typeof doctor.$inferInsert;
