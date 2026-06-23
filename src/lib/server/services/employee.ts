import { eq, asc, inArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { employee } from '$lib/server/db/schema/employee';
import {
	createEmployeeSchema,
	updateEmployeeSchema,
	type CreateEmployeeInput,
	type UpdateEmployeeInput
} from '$lib/schemas/employee';
import {
	canReadEmployee,
	canWriteEmployee,
	canDeleteEmployee,
	type UserPermissions
} from '$lib/server/permissions';

const employeeWith = { department: true, role: true, facility: true } as const;

function assertCanRead(perms: UserPermissions, departmentId: string) {
	if (!canReadEmployee(perms, departmentId)) error(403, 'Forbidden');
}

function assertCanWrite(perms: UserPermissions, departmentId: string) {
	if (!canWriteEmployee(perms, departmentId)) error(403, 'Forbidden');
}

function assertCanDelete(perms: UserPermissions, departmentId: string) {
	if (!canDeleteEmployee(perms, departmentId)) error(403, 'Forbidden');
}

function filterReadableEmployees<T extends { departmentId: string }>(
	perms: UserPermissions,
	records: T[]
): T[] {
	if (perms.isAdmin) return records;
	return records.filter((record) => canReadEmployee(perms, record.departmentId));
}

export async function listEmployees(perms: UserPermissions) {
	const records = await db.query.employee.findMany({
		with: employeeWith,
		orderBy: [asc(employee.lastName), asc(employee.firstName)]
	});

	return filterReadableEmployees(perms, records);
}

export async function getEmployee(perms: UserPermissions, id: string) {
	const record = await db.query.employee.findFirst({
		where: eq(employee.id, id),
		with: employeeWith
	});

	if (!record) error(404, 'Employee not found');
	assertCanRead(perms, record.departmentId);
	return record;
}

export async function createEmployee(perms: UserPermissions, input: CreateEmployeeInput) {
	const data = createEmployeeSchema.parse(input);
	assertCanWrite(perms, data.departmentId);

	const [record] = await db.insert(employee).values(data).returning();
	return getEmployee(perms, record.id);
}

export async function updateEmployee(
	perms: UserPermissions,
	id: string,
	input: UpdateEmployeeInput
) {
	const existing = await getEmployee(perms, id);
	const data = updateEmployeeSchema.parse(input);

	if (data.departmentId && data.departmentId !== existing.departmentId) {
		assertCanWrite(perms, data.departmentId);
	}

	assertCanWrite(perms, existing.departmentId);

	await db
		.update(employee)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(employee.id, id));

	return getEmployee(perms, id);
}

export async function deleteEmployee(perms: UserPermissions, id: string) {
	const existing = await getEmployee(perms, id);
	assertCanDelete(perms, existing.departmentId);
	await db.delete(employee).where(eq(employee.id, id));
}

export async function listEmployeesByDepartmentIds(departmentIds: string[]) {
	if (departmentIds.length === 0) return [];

	return db.query.employee.findMany({
		where: inArray(employee.departmentId, departmentIds),
		with: employeeWith,
		orderBy: [asc(employee.lastName), asc(employee.firstName)]
	});
}
