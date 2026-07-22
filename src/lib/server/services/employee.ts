import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { employee } from '$lib/server/db/schema/employee';
import {
	createEmployeeSchema,
	updateEmployeeSchema,
	type CreateEmployeeInput,
	type OverrideEmployeesFromExcelInput,
	type UpdateEmployeeInput
} from '$lib/schemas/employee';
import {
	canDeleteEmployeeMaster,
	canManageEmployeeMaster,
	canReadEmployeeMaster,
	type UserPermissions
} from '$lib/server/permissions';
import {
	decodeExcelBase64,
	excelText,
	parseExcelBoolean,
	parseExcelDate,
	parseExcelRows,
	parseExcelTimestamp
} from '$lib/server/excel-import';

function assertCanRead(perms: UserPermissions) {
	if (!canReadEmployeeMaster(perms)) error(403, 'Forbidden');
}

function assertCanManage(perms: UserPermissions) {
	if (!canManageEmployeeMaster(perms)) error(403, 'Forbidden');
}

function assertCanDelete(perms: UserPermissions) {
	if (!canDeleteEmployeeMaster(perms)) error(403, 'Forbidden');
}

function normalizeEntryDate(value: CreateEmployeeInput['entryDate']) {
	if (value == null) return null;
	return value instanceof Date ? value : new Date(value);
}

export async function listEmployees(perms: UserPermissions) {
	assertCanRead(perms);
	return db.query.employee.findMany({
		orderBy: [asc(employee.employeeName), asc(employee.employeeNo)]
	});
}

export async function getEmployee(perms: UserPermissions, id: string) {
	assertCanRead(perms);
	const record = await db.query.employee.findFirst({
		where: eq(employee.id, id)
	});

	if (!record) error(404, 'Employee not found');
	return record;
}

export async function createEmployee(perms: UserPermissions, input: CreateEmployeeInput) {
	assertCanManage(perms);
	const data = createEmployeeSchema.parse(input);
	const existing = await db.query.employee.findFirst({
		where: eq(employee.id, data.id)
	});
	if (existing) error(409, 'Employee id already exists');

	const [record] = await db
		.insert(employee)
		.values({
			id: data.id,
			employeeNo: data.employeeNo ?? null,
			employeeName: data.employeeName ?? null,
			position: data.position ?? null,
			department: data.department ?? null,
			joinDate: data.joinDate ?? null,
			facility: data.facility ?? null,
			userId: data.userId ?? null,
			entryDate: normalizeEntryDate(data.entryDate),
			active: data.active ?? null
		})
		.returning();
	return record;
}

export async function updateEmployee(
	perms: UserPermissions,
	id: string,
	input: UpdateEmployeeInput
) {
	assertCanManage(perms);
	await getEmployee(perms, id);
	const data = updateEmployeeSchema.parse(input);

	const [record] = await db
		.update(employee)
		.set({
			...(data.employeeNo !== undefined ? { employeeNo: data.employeeNo } : {}),
			...(data.employeeName !== undefined ? { employeeName: data.employeeName } : {}),
			...(data.position !== undefined ? { position: data.position } : {}),
			...(data.department !== undefined ? { department: data.department } : {}),
			...(data.joinDate !== undefined ? { joinDate: data.joinDate } : {}),
			...(data.facility !== undefined ? { facility: data.facility } : {}),
			...(data.userId !== undefined ? { userId: data.userId } : {}),
			...(data.entryDate !== undefined ? { entryDate: normalizeEntryDate(data.entryDate) } : {}),
			...(data.active !== undefined ? { active: data.active } : {})
		})
		.where(eq(employee.id, id))
		.returning();
	return record;
}

export async function deleteEmployee(perms: UserPermissions, id: string) {
	assertCanDelete(perms);
	await getEmployee(perms, id);
	await db.delete(employee).where(eq(employee.id, id));
}

export async function overrideEmployeesFromExcel(
	perms: UserPermissions,
	input: OverrideEmployeesFromExcelInput
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
			employeeNo: excelText(row, 'employee_no', 'employeeno'),
			employeeName: excelText(row, 'employee_name', 'employeename'),
			position: excelText(row, 'position'),
			department: excelText(row, 'department'),
			joinDate: parseExcelDate(row.join_date ?? row.joindate),
			facility: excelText(row, 'facility'),
			entryDate: parseExcelTimestamp(row.entry_date ?? row.entrydate),
			userId: excelText(row, 'user_id', 'userid'),
			active: parseExcelBoolean(row.active)
		};
	});

	const ids = values.map((row) => row.id);
	if (new Set(ids).size !== ids.length) {
		error(400, 'Excel file contains duplicate id values');
	}

	await db.delete(employee);
	if (values.length === 0) return { imported: 0 };

	const batchSize = 500;
	let imported = 0;
	try {
		for (let i = 0; i < values.length; i += batchSize) {
			const batch = values.slice(i, i + batchSize);
			const inserted = await db.insert(employee).values(batch).returning({ id: employee.id });
			imported += inserted.length;
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to import Excel file';
		error(500, message);
	}

	return { imported };
}
