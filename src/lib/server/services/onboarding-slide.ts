import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { onboardingSlide } from '$lib/server/db/schema/onboarding-slide';
import {
	createOnboardingSlideSchema,
	updateOnboardingSlideSchema,
	type CreateOnboardingSlideInput,
	type UpdateOnboardingSlideInput
} from '$lib/schemas/onboarding-slide';
import {
	canSettingsOnboardingCreate,
	canSettingsOnboardingDelete,
	canSettingsOnboardingUpdate,
	type UserPermissions
} from '$lib/server/permissions';

function assertCanCreate(perms: UserPermissions) {
	if (!canSettingsOnboardingCreate(perms)) error(403, 'Forbidden');
}

function assertCanUpdate(perms: UserPermissions) {
	if (!canSettingsOnboardingUpdate(perms)) error(403, 'Forbidden');
}

function assertCanDelete(perms: UserPermissions) {
	if (!canSettingsOnboardingDelete(perms)) error(403, 'Forbidden');
}

const slideOrder = [asc(onboardingSlide.sortOrder), asc(onboardingSlide.createdAt)];

export async function listOnboardingSlides(_perms: UserPermissions) {
	return db.query.onboardingSlide.findMany({
		orderBy: slideOrder
	});
}

export async function listPublicOnboardingSlides() {
	return db.query.onboardingSlide.findMany({
		orderBy: slideOrder
	});
}

export async function getOnboardingSlide(perms: UserPermissions, id: string) {
	const record = await db.query.onboardingSlide.findFirst({
		where: eq(onboardingSlide.id, id)
	});

	if (!record) error(404, 'Onboarding slide not found');
	return record;
}

export async function createOnboardingSlide(
	perms: UserPermissions,
	input: CreateOnboardingSlideInput
) {
	assertCanCreate(perms);

	const data = createOnboardingSlideSchema.parse(input);
	const [record] = await db.insert(onboardingSlide).values(data).returning();
	return record;
}

export async function updateOnboardingSlide(
	perms: UserPermissions,
	id: string,
	input: UpdateOnboardingSlideInput
) {
	assertCanUpdate(perms);

	await getOnboardingSlide(perms, id);
	const data = updateOnboardingSlideSchema.parse(input);

	const [record] = await db
		.update(onboardingSlide)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(onboardingSlide.id, id))
		.returning();

	return record;
}

export async function deleteOnboardingSlide(perms: UserPermissions, id: string) {
	assertCanDelete(perms);

	await getOnboardingSlide(perms, id);
	await db.delete(onboardingSlide).where(eq(onboardingSlide.id, id));
}
