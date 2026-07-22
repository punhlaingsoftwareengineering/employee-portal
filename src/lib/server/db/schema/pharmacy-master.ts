import { boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const pharmacyMaster = pgTable('pharmacy_master', {
	id: text('id').primaryKey(),
	itemClass: text('class'),
	subClass: text('sub_class'),
	itemName: text('item_name'),
	genericName: text('generic_name'),
	strengthValue: text('strength_value'),
	issueUnit: text('issue_unit'),
	entryDate: timestamp('entry_date', { withTimezone: true }).defaultNow(),
	active: boolean('active').default(true),
	facilityId: text('facility_id')
});

export type PharmacyMaster = typeof pharmacyMaster.$inferSelect;
export type NewPharmacyMaster = typeof pharmacyMaster.$inferInsert;
