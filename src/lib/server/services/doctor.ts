import { asc, eq, isNull, or, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { doctor } from '$lib/server/db/schema/doctor';
import {
	createDoctorSchema,
	updateDoctorSchema,
	type CreateDoctorInput,
	type OverrideDoctorsFromExcelInput,
	type UpdateDoctorInput
} from '$lib/schemas/doctor';
import {
	canCreateDoctorMaster,
	canDeleteDoctorMaster,
	canExcelOverrideDoctorMaster,
	canReadDoctorMaster,
	canUpdateDoctorMaster,
	type UserPermissions
} from '$lib/server/permissions';
import {
	decodeExcelBase64,
	excelText,
	parseExcelBoolean,
	parseExcelRows
} from '$lib/server/excel-import';

function isUniqueViolation(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		(err as { code?: string }).code === '23505'
	);
}

function assertCanRead(perms: UserPermissions) {
	if (!canReadDoctorMaster(perms)) error(403, 'Forbidden');
}

function assertCanCreate(perms: UserPermissions) {
	if (!canCreateDoctorMaster(perms)) error(403, 'Forbidden');
}

function assertCanUpdate(perms: UserPermissions) {
	if (!canUpdateDoctorMaster(perms)) error(403, 'Forbidden');
}

function assertCanExcelOverride(perms: UserPermissions) {
	if (!canExcelOverrideDoctorMaster(perms)) error(403, 'Forbidden');
}

function assertCanDelete(perms: UserPermissions) {
	if (!canDeleteDoctorMaster(perms)) error(403, 'Forbidden');
}

function parseOptionalInt(value: unknown, label: string, rowIndex: number): number | null {
	if (value == null || value === '') return null;
	if (typeof value === 'number' && Number.isFinite(value)) return Math.trunc(value);
	const text = String(value).trim();
	if (!text) return null;
	const n = Number(text);
	if (!Number.isFinite(n)) error(400, `Row ${rowIndex}: ${label} must be a number`);
	return Math.trunc(n);
}

/** Public directory — hide inactive (`active = false`). */
export async function listPublicDoctors() {
	return db.query.doctor.findMany({
		where: or(eq(doctor.active, true), isNull(doctor.active)),
		orderBy: [asc(doctor.doctorName), asc(doctor.drnno)]
	});
}

export async function listDoctors(perms: UserPermissions) {
	assertCanRead(perms);
	return db.query.doctor.findMany({
		orderBy: [asc(doctor.doctorName), asc(doctor.drnno)]
	});
}

export async function getDoctor(perms: UserPermissions, id: number) {
	assertCanRead(perms);
	const record = await db.query.doctor.findFirst({
		where: eq(doctor.id, id)
	});

	if (!record) error(404, 'Doctor not found');
	return record;
}

export async function createDoctor(perms: UserPermissions, input: CreateDoctorInput) {
	assertCanCreate(perms);
	const data = createDoctorSchema.parse(input);

	const [record] = await db
		.insert(doctor)
		.values({
			hisid: data.hisid ?? null,
			facilityName: data.facilityName ?? null,
			drnno: data.drnno ?? null,
			doctorName: data.doctorName ?? null,
			specialization: data.specialization ?? null,
			active: data.active ?? null
		})
		.returning();
	return record;
}

export async function updateDoctor(perms: UserPermissions, id: number, input: UpdateDoctorInput) {
	assertCanUpdate(perms);
	await getDoctor(perms, id);
	const data = updateDoctorSchema.parse(input);

	const [record] = await db
		.update(doctor)
		.set({
			...(data.hisid !== undefined ? { hisid: data.hisid } : {}),
			...(data.facilityName !== undefined ? { facilityName: data.facilityName } : {}),
			...(data.drnno !== undefined ? { drnno: data.drnno } : {}),
			...(data.doctorName !== undefined ? { doctorName: data.doctorName } : {}),
			...(data.specialization !== undefined ? { specialization: data.specialization } : {}),
			...(data.active !== undefined ? { active: data.active } : {})
		})
		.where(eq(doctor.id, id))
		.returning();
	return record;
}

export async function deleteDoctor(perms: UserPermissions, id: number) {
	assertCanDelete(perms);
	await getDoctor(perms, id);
	await db.delete(doctor).where(eq(doctor.id, id));
}

export async function overrideDoctorsFromExcel(
	perms: UserPermissions,
	input: OverrideDoctorsFromExcelInput
) {
	assertCanExcelOverride(perms);
	const bytes = decodeExcelBase64(input.fileBase64);
	const rows = parseExcelRows(bytes);

	if (rows.length === 0) error(400, 'Excel file has no data rows');

	const values: {
		id: number;
		hisid: number | null;
		facilityName: string | null;
		drnno: string | null;
		doctorName: string | null;
		specialization: string | null;
		active: boolean | null;
	}[] = [];

	for (let index = 0; index < rows.length; index++) {
		const row = rows[index]!;
		const rowIndex = index + 2;
		const idRaw = row.id;
		const idText = idRaw == null ? '' : String(idRaw).trim();
		// Skip title / blank / non-id rows instead of failing the import
		if (!idText) continue;

		const id = parseOptionalInt(idRaw, 'id', rowIndex);
		if (id == null) error(400, `Row ${rowIndex}: id must be a number`);

		values.push({
			id,
			hisid: parseOptionalInt(row.hisid ?? row.his_id, 'hisid', rowIndex),
			facilityName: excelText(row, 'facility_name', 'facilityname', 'facility'),
			drnno: excelText(row, 'drnno', 'drn_no', 'dr_n_no', 'dr_nno', 'doctor_no', 'doctorno'),
			doctorName: excelText(row, 'doctor_name', 'doctorname', 'name'),
			specialization: excelText(row, 'specialization', 'specialty'),
			active: parseExcelBoolean(row.active)
		});
	}

	if (values.length === 0) {
		error(400, 'Excel file has no rows with a valid id');
	}

	const hasMappedFields = values.some(
		(row) =>
			row.hisid != null ||
			row.facilityName != null ||
			row.drnno != null ||
			row.doctorName != null ||
			row.specialization != null ||
			row.active != null
	);
	if (!hasMappedFields) {
		error(
			400,
			'Excel headers did not match doctor columns. Expected: id, facility_name, drnno (or drn_no), doctor_name, specialization, active (optional: hisid)'
		);
	}

	const ids = values.map((row) => row.id);
	if (new Set(ids).size !== ids.length) {
		error(400, 'Excel file contains duplicate id values');
	}

	await db.delete(doctor);
	if (values.length === 0) return { imported: 0 };

	const batchSize = 500;
	let imported = 0;
	try {
		for (let i = 0; i < values.length; i += batchSize) {
			const batch = values.slice(i, i + batchSize);
			const inserted = await db.insert(doctor).values(batch).returning({ id: doctor.id });
			imported += inserted.length;
		}
	} catch (err) {
		if (isUniqueViolation(err)) {
			error(409, 'Excel file contains duplicate id values');
		}
		const message = err instanceof Error ? err.message : 'Failed to import Excel file';
		error(500, message);
	}

	await db.execute(sql`
		SELECT setval(
			pg_get_serial_sequence('doctor', 'id'),
			COALESCE((SELECT MAX(id) FROM doctor), 1),
			(SELECT MAX(id) FROM doctor) IS NOT NULL
		)
	`);

	return { imported };
}
