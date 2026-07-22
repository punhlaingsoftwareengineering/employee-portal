import { asc, eq, isNull, or } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { pharmacyMaster } from '$lib/server/db/schema/pharmacy-master';
import {
	createPharmacyMasterSchema,
	updatePharmacyMasterSchema,
	type CreatePharmacyMasterInput,
	type OverridePharmacyMastersFromExcelInput,
	type UpdatePharmacyMasterInput
} from '$lib/schemas/pharmacy-master';
import {
	canManagePharmacy,
	canReadPharmacy,
	type UserPermissions
} from '$lib/server/permissions';
import {
	decodeExcelBase64,
	excelText,
	parseExcelBoolean,
	parseExcelRows,
	parseExcelTimestamp
} from '$lib/server/excel-import';

function assertCanRead(perms: UserPermissions) {
	if (!canReadPharmacy(perms)) error(403, 'Forbidden');
}

function assertCanManage(perms: UserPermissions) {
	if (!canManagePharmacy(perms)) error(403, 'Forbidden');
}

function normalizeEntryDate(value: CreatePharmacyMasterInput['entryDate']) {
	if (value == null) return null;
	return value instanceof Date ? value : new Date(value);
}

/** Public onboarding list — hide inactive (`active = 0` / false). */
export async function listPublicPharmacyMasters() {
	return db.query.pharmacyMaster.findMany({
		where: or(eq(pharmacyMaster.active, true), isNull(pharmacyMaster.active)),
		orderBy: [asc(pharmacyMaster.itemName), asc(pharmacyMaster.itemClass)]
	});
}

export async function listPharmacyMasters(perms: UserPermissions) {
	assertCanRead(perms);
	return db.query.pharmacyMaster.findMany({
		orderBy: [asc(pharmacyMaster.itemName), asc(pharmacyMaster.itemClass)]
	});
}

export async function getPharmacyMaster(perms: UserPermissions, id: string) {
	assertCanRead(perms);
	const record = await db.query.pharmacyMaster.findFirst({
		where: eq(pharmacyMaster.id, id)
	});

	if (!record) error(404, 'Pharmacy item not found');
	return record;
}

export async function createPharmacyMaster(perms: UserPermissions, input: CreatePharmacyMasterInput) {
	assertCanManage(perms);
	const data = createPharmacyMasterSchema.parse(input);

	const existing = await db.query.pharmacyMaster.findFirst({
		where: eq(pharmacyMaster.id, data.id)
	});
	if (existing) error(409, 'Pharmacy item id already exists');

	const [record] = await db
		.insert(pharmacyMaster)
		.values({
			id: data.id,
			itemClass: data.itemClass ?? null,
			subClass: data.subClass ?? null,
			itemName: data.itemName ?? null,
			genericName: data.genericName ?? null,
			strengthValue: data.strengthValue ?? null,
			issueUnit: data.issueUnit ?? null,
			facilityId: data.facilityId ?? null,
			entryDate: normalizeEntryDate(data.entryDate),
			active: data.active ?? null
		})
		.returning();
	return record;
}

export async function updatePharmacyMaster(
	perms: UserPermissions,
	id: string,
	input: UpdatePharmacyMasterInput
) {
	assertCanManage(perms);
	await getPharmacyMaster(perms, id);
	const data = updatePharmacyMasterSchema.parse(input);

	const [record] = await db
		.update(pharmacyMaster)
		.set({
			...(data.itemClass !== undefined ? { itemClass: data.itemClass } : {}),
			...(data.subClass !== undefined ? { subClass: data.subClass } : {}),
			...(data.itemName !== undefined ? { itemName: data.itemName } : {}),
			...(data.genericName !== undefined ? { genericName: data.genericName } : {}),
			...(data.strengthValue !== undefined ? { strengthValue: data.strengthValue } : {}),
			...(data.issueUnit !== undefined ? { issueUnit: data.issueUnit } : {}),
			...(data.facilityId !== undefined ? { facilityId: data.facilityId } : {}),
			...(data.entryDate !== undefined ? { entryDate: normalizeEntryDate(data.entryDate) } : {}),
			...(data.active !== undefined ? { active: data.active } : {})
		})
		.where(eq(pharmacyMaster.id, id))
		.returning();
	return record;
}

export async function deletePharmacyMaster(perms: UserPermissions, id: string) {
	assertCanManage(perms);
	await getPharmacyMaster(perms, id);
	await db.delete(pharmacyMaster).where(eq(pharmacyMaster.id, id));
}

export async function overridePharmacyMastersFromExcel(
	perms: UserPermissions,
	input: OverridePharmacyMastersFromExcelInput
) {
	assertCanManage(perms);
	const bytes = decodeExcelBase64(input.fileBase64);
	const rows = parseExcelRows(bytes);

	if (rows.length === 0) error(400, 'Excel file has no data rows');

	const values = rows.map((row, index) => {
		const id = excelText(row, 'id');
		if (!id) error(400, `Row ${index + 2}: id is required`);

		return {
			id,
			itemClass: excelText(row, 'class', 'item_class', 'itemclass'),
			subClass: excelText(row, 'sub_class', 'subclass'),
			itemName: excelText(row, 'item_name', 'itemname'),
			genericName: excelText(row, 'generic_name', 'genericname'),
			strengthValue: excelText(row, 'strength_value', 'strengthvalue', 'strength'),
			issueUnit: excelText(row, 'issue_unit', 'issueunit'),
			entryDate: parseExcelTimestamp(row.entry_date ?? row.entrydate),
			active: parseExcelBoolean(row.active),
			facilityId: excelText(row, 'facility_id', 'facilityid', 'facility')
		};
	});

	const ids = values.map((row) => row.id);
	if (new Set(ids).size !== ids.length) {
		error(400, 'Excel file contains duplicate id values');
	}

	await db.delete(pharmacyMaster);
	if (values.length === 0) return { imported: 0 };

	const batchSize = 500;
	let imported = 0;
	try {
		for (let i = 0; i < values.length; i += batchSize) {
			const batch = values.slice(i, i + batchSize);
			const inserted = await db
				.insert(pharmacyMaster)
				.values(batch)
				.returning({ id: pharmacyMaster.id });
			imported += inserted.length;
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to import Excel file';
		error(500, message);
	}

	return { imported };
}
