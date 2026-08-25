import { asc, eq, isNull, or } from 'drizzle-orm';
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
	canCreateEmployeeMaster,
	canDeleteEmployeeMaster,
	canExcelOverrideEmployeeMaster,
	canReadEmployeeMaster,
	canUpdateEmployeeMaster,
	type UserPermissions
} from '$lib/server/permissions';
import {
	decodeExcelBase64,
	excelEmployeeNo,
	excelText,
	parseExcelBoolean,
	parseExcelDate,
	parseEmployeeExcelRows,
	parseExcelTimestamp
} from '$lib/server/excel-import';
import { newEmployeeRowId } from '$lib/utils/employee-id';

function isUniqueViolation(err: unknown): boolean {
	return (
		typeof err === 'object' &&
		err !== null &&
		'code' in err &&
		(err as { code?: string }).code === '23505'
	);
}
function assertCanRead(perms: UserPermissions) {
	if (!canReadEmployeeMaster(perms)) error(403, 'Forbidden');
}

function assertCanCreate(perms: UserPermissions) {
	if (!canCreateEmployeeMaster(perms)) error(403, 'Forbidden');
}

function assertCanUpdate(perms: UserPermissions) {
	if (!canUpdateEmployeeMaster(perms)) error(403, 'Forbidden');
}

function assertCanExcelOverride(perms: UserPermissions) {
	if (!canExcelOverrideEmployeeMaster(perms)) error(403, 'Forbidden');
}

function assertCanDelete(perms: UserPermissions) {
	if (!canDeleteEmployeeMaster(perms)) error(403, 'Forbidden');
}

function normalizeEntryDate(value: CreateEmployeeInput['entryDate']) {
	if (value == null) return null;
	return value instanceof Date ? value : new Date(value);
}

/** Public directory — hide inactive employees. */
export async function listPublicEmployees() {
	return db.query.employee.findMany({
		where: or(eq(employee.active, true), isNull(employee.active)),
		orderBy: [asc(employee.employeeName), asc(employee.employeeNo)]
	});
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
	assertCanCreate(perms);
	const data = createEmployeeSchema.parse(input);
	const id = newEmployeeRowId(data.id ?? data.employeeNo);
	const existing = await db.query.employee.findFirst({
		where: eq(employee.id, id)
	});
	if (existing) {
		error(
			409,
			`Employee ID "${id}" already exists. Choose a different ID or edit the existing record.`
		);
	}

	try {
		const [record] = await db
			.insert(employee)
			.values({
				id,
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
	} catch (err) {
		if (isUniqueViolation(err)) {
			error(
				409,
				`Employee ID "${id}" already exists. Choose a different ID or edit the existing record.`
			);
		}
		throw err;
	}
}

export async function updateEmployee(
	perms: UserPermissions,
	id: string,
	input: UpdateEmployeeInput
) {
	assertCanUpdate(perms);
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
	assertCanExcelOverride(perms);
	const bytes = decodeExcelBase64(input.fileBase64);
	const rows = parseEmployeeExcelRows(bytes);

	if (rows.length === 0) error(400, 'Excel file has no data rows');

	const values: {
		id: string;
		employeeNo: string | null;
		employeeName: string | null;
		position: string | null;
		department: string | null;
		joinDate: string | null;
		facility: string | null;
		entryDate: Date | null;
		userId: string | null;
		active: boolean | null;
	}[] = [];
	const usedIds = new Set<string>();

	for (let index = 0; index < rows.length; index++) {
		const row = rows[index]!;
		const employeeNo = excelEmployeeNo(row, 'emp_no', 'employee_no', 'employeeno', 'id');
		const employeeName = excelText(row, 'name', 'employee_name', 'employeename');
		if (!employeeNo && !employeeName) continue;

		const position = excelText(row, 'position');
		const department = excelText(row, 'department');
		const facility = excelText(row, 'facility');
		let id = newEmployeeRowId(employeeNo);
		if (usedIds.has(id)) {
			if (employeeNo) {
				error(400, `Excel file contains duplicate Emp No "${employeeNo}"`);
			}
			id = crypto.randomUUID();
		}
		usedIds.add(id);
		values.push({
			id,
			employeeNo,
			employeeName,
			position,
			department,
			joinDate: parseExcelDate(row.joined_date ?? row.join_date ?? row.joindate ?? row.joineddate),
			facility,
			entryDate: parseExcelTimestamp(row.entry_date ?? row.entrydate),
			userId: excelText(row, 'user_id', 'userid'),
			active: parseExcelBoolean(row.active) ?? true
		});
	}

	if (values.length === 0) {
		error(
			400,
			'Excel headers did not match employee columns. Expected: Emp No, Name, Position, Department, Joined Date, Facility'
		);
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
