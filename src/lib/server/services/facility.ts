import { eq, asc } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { facility } from '$lib/server/db/schema/facility';
import {
	createFacilitySchema,
	updateFacilitySchema,
	type CreateFacilityInput,
	type UpdateFacilityInput
} from '$lib/schemas/facility';
import {
	canReadFacilities,
	canManageFacilities,
	type UserPermissions
} from '$lib/server/permissions';

function assertCanRead(perms: UserPermissions) {
	if (!canReadFacilities(perms)) error(403, 'Forbidden');
}

function assertCanManage(perms: UserPermissions) {
	if (!canManageFacilities(perms)) error(403, 'Forbidden');
}

export async function listFacilities(perms: UserPermissions) {
	assertCanRead(perms);

	return db.query.facility.findMany({
		orderBy: [asc(facility.name)]
	});
}

export async function getFacility(perms: UserPermissions, id: string) {
	assertCanRead(perms);

	const record = await db.query.facility.findFirst({
		where: eq(facility.id, id)
	});

	if (!record) error(404, 'Facility not found');
	return record;
}

export async function createFacility(perms: UserPermissions, input: CreateFacilityInput) {
	assertCanManage(perms);

	const data = createFacilitySchema.parse(input);
	const [record] = await db.insert(facility).values(data).returning();
	return record;
}

export async function updateFacility(
	perms: UserPermissions,
	id: string,
	input: UpdateFacilityInput
) {
	assertCanManage(perms);

	await getFacility(perms, id);
	const data = updateFacilitySchema.parse(input);

	const [record] = await db
		.update(facility)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(facility.id, id))
		.returning();

	return record;
}

export async function deleteFacility(perms: UserPermissions, id: string) {
	assertCanManage(perms);

	await getFacility(perms, id);
	await db.delete(facility).where(eq(facility.id, id));
}

export async function listAllFacilities() {
	return db.query.facility.findMany({
		orderBy: [asc(facility.name)]
	});
}
