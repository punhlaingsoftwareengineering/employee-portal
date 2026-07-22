import { eq, asc, inArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { department } from '$lib/server/db/schema/department';
import {
	createDepartmentSchema,
	updateDepartmentSchema,
	type CreateDepartmentInput,
	type UpdateDepartmentInput
} from '$lib/schemas/department';
import {
	canReadDepartment,
	canWriteDepartment,
	canCreateDepartment,
	type UserPermissions
} from '$lib/server/permissions';

function filterReadableDepartments<T extends { id: string }>(
	perms: UserPermissions,
	records: T[]
): T[] {
	if (perms.isAdmin) return records;
	return records.filter((record) => canReadDepartment(perms, record.id));
}

export async function listDepartments(perms: UserPermissions) {
	const records = await db.query.department.findMany({
		orderBy: [asc(department.name)]
	});

	return filterReadableDepartments(perms, records);
}

export async function getDepartment(perms: UserPermissions, id: string) {
	const record = await db.query.department.findFirst({
		where: eq(department.id, id)
	});

	if (!record) error(404, 'Department not found');
	if (!canReadDepartment(perms, id)) error(403, 'Forbidden');
	return record;
}

export async function createDepartment(perms: UserPermissions, input: CreateDepartmentInput) {
	if (!canCreateDepartment(perms)) error(403, 'Forbidden');

	const data = createDepartmentSchema.parse(input);
	const [record] = await db.insert(department).values(data).returning();
	return record;
}

export async function updateDepartment(
	perms: UserPermissions,
	id: string,
	input: UpdateDepartmentInput
) {
	if (!canWriteDepartment(perms, id)) error(403, 'Forbidden');

	await getDepartment(perms, id);
	const data = updateDepartmentSchema.parse(input);

	const [record] = await db
		.update(department)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(department.id, id))
		.returning();

	return record;
}

export async function deleteDepartment(perms: UserPermissions, id: string) {
	if (!canWriteDepartment(perms, id)) error(403, 'Forbidden');

	await getDepartment(perms, id);
	await db.delete(department).where(eq(department.id, id));
}

export async function listAllDepartments() {
	return db.query.department.findMany({
		orderBy: [asc(department.name)]
	});
}

export async function listDepartmentsByIds(ids: string[]) {
	if (ids.length === 0) return [];

	return db.query.department.findMany({
		where: inArray(department.id, ids),
		orderBy: [asc(department.name)]
	});
}
