import { eq, asc, inArray } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { isOptionalFeatureDbError } from '$lib/server/db/errors';
import { facility } from '$lib/server/db/schema/facility';
import {
	createFacilitySchema,
	updateFacilitySchema,
	type CreateFacilityInput,
	type UpdateFacilityInput
} from '$lib/schemas/facility';
import {
	canReadFacility,
	canCreateFacility,
	canDeleteFacility,
	canReadFacilities,
	canUpdateFacility,
	getReadableFacilityIds,
	type UserPermissions
} from '$lib/server/permissions';

export async function listFacilities(perms: UserPermissions) {
	if (!canReadFacilities(perms)) error(403, 'Forbidden');

	const readable = getReadableFacilityIds(perms);
	if (readable === 'all') {
		return db.query.facility.findMany({
			orderBy: [asc(facility.name)]
		});
	}
	if (readable.length === 0) return [];

	return db.query.facility.findMany({
		where: inArray(facility.id, readable),
		orderBy: [asc(facility.name)]
	});
}

export async function getFacility(perms: UserPermissions, id: string) {
	const record = await db.query.facility.findFirst({
		where: eq(facility.id, id)
	});

	if (!record) error(404, 'Facility not found');
	if (!canReadFacility(perms, id)) error(403, 'Forbidden');
	return record;
}

export async function createFacility(perms: UserPermissions, input: CreateFacilityInput) {
	if (!canCreateFacility(perms)) error(403, 'Forbidden');

	const data = createFacilitySchema.parse(input);
	const [record] = await db
		.insert(facility)
		.values({
			...data,
			showOnOnboarding: data.showOnOnboarding ?? false
		})
		.returning();
	return record;
}

export async function updateFacility(
	perms: UserPermissions,
	id: string,
	input: UpdateFacilityInput
) {
	if (!canUpdateFacility(perms, id)) error(403, 'Forbidden');

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
	if (!canDeleteFacility(perms, id)) error(403, 'Forbidden');

	await getFacility(perms, id);
	await db.delete(facility).where(eq(facility.id, id));
}

export async function listAllFacilities() {
	return db.query.facility.findMany({
		orderBy: [asc(facility.name)]
	});
}

/** Public onboarding showcase — facilities marked to show on onboarding. */
export async function listOnboardingFacilities() {
	try {
		return await db.query.facility.findMany({
			where: eq(facility.showOnOnboarding, true),
			orderBy: [asc(facility.name)]
		});
	} catch (err) {
		if (isOptionalFeatureDbError(err)) return [];
		throw err;
	}
}
