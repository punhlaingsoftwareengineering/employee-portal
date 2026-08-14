import { and, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { department } from '$lib/server/db/schema/department';
import { departmentRating } from '$lib/server/db/schema/department-rating';
import {
	saveDepartmentRatingSchema,
	type SaveDepartmentRatingInput
} from '$lib/schemas/rating';
import type { UserPermissions } from '$lib/server/permissions';
import { listAllDepartments } from '$lib/server/services/department';

export async function listRatingDepartments(_perms: UserPermissions) {
	return listAllDepartments();
}

export async function getMyDepartmentRating(
	perms: UserPermissions,
	departmentId: string
) {
	const dept = await db.query.department.findFirst({
		where: eq(department.id, departmentId)
	});
	if (!dept) error(404, 'Department not found');

	const rating = await db.query.departmentRating.findFirst({
		where: and(
			eq(departmentRating.userId, perms.userId),
			eq(departmentRating.departmentId, departmentId)
		)
	});

	return {
		department: dept,
		rating: rating ?? null
	};
}

export async function saveDepartmentRating(
	perms: UserPermissions,
	input: SaveDepartmentRatingInput
) {
	const data = saveDepartmentRatingSchema.parse(input);

	const dept = await db.query.department.findFirst({
		where: eq(department.id, data.departmentId)
	});
	if (!dept) error(404, 'Department not found');

	const existing = await db.query.departmentRating.findFirst({
		where: and(
			eq(departmentRating.userId, perms.userId),
			eq(departmentRating.departmentId, data.departmentId)
		)
	});

	if (existing) {
		const [updated] = await db
			.update(departmentRating)
			.set({ score: data.score, updatedAt: new Date() })
			.where(eq(departmentRating.id, existing.id))
			.returning();

		return { department: dept, rating: updated };
	}

	const [created] = await db
		.insert(departmentRating)
		.values({
			userId: perms.userId,
			departmentId: data.departmentId,
			score: data.score
		})
		.returning();

	return { department: dept, rating: created };
}
