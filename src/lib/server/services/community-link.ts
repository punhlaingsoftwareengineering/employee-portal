import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { accessRoleCommunityLink } from '$lib/server/db/schema/access-role-community-link';
import { communityLink } from '$lib/server/db/schema/community-link';
import {
	createCommunityLinkSchema,
	updateCommunityLinkSchema,
	type CreateCommunityLinkInput,
	type UpdateCommunityLinkInput
} from '$lib/schemas/community-link';
import { canManageCommunity, type UserPermissions } from '$lib/server/permissions';
import { getCommunityCategory } from '$lib/server/services/community-category';

const linkOrder = [asc(communityLink.sortOrder), asc(communityLink.createdAt)];

function requireCommunityManage(perms: UserPermissions) {
	if (!canManageCommunity(perms)) error(403, 'Forbidden');
}

function mergeLinksById(...lists: (typeof communityLink.$inferSelect)[][]) {
	const seen = new Set<string>();
	const results: (typeof communityLink.$inferSelect)[] = [];

	for (const list of lists) {
		for (const item of list) {
			if (seen.has(item.id)) continue;
			seen.add(item.id);
			results.push(item);
		}
	}

	return results.sort((a, b) => {
		if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
		return a.createdAt.getTime() - b.createdAt.getTime();
	});
}

export async function listPublicCommunityLinks() {
	return db.query.communityLink.findMany({
		where: eq(communityLink.isPublic, true),
		orderBy: linkOrder
	});
}

export async function listCommunityLinks(_perms: UserPermissions) {
	return db.query.communityLink.findMany({
		orderBy: linkOrder
	});
}

export async function getCommunityLinksForViewer(permissions: UserPermissions | null) {
	if (!permissions) {
		return listPublicCommunityLinks();
	}

	if (permissions.isAdmin) {
		return listCommunityLinks(permissions);
	}

	const publicLinks = await listPublicCommunityLinks();

	const roleIds = [...new Set(permissions.departmentRoles.map((assignment) => assignment.roleId))];
	if (roleIds.length === 0) return publicLinks;

	const assignments = await db.query.accessRoleCommunityLink.findMany({
		where: inArray(accessRoleCommunityLink.roleId, roleIds),
		with: { communityLink: true }
	});

	const roleLinks = assignments.map((assignment) => assignment.communityLink);
	return mergeLinksById(publicLinks, roleLinks);
}

export async function getCommunityLink(perms: UserPermissions, id: string) {
	const record = await db.query.communityLink.findFirst({
		where: eq(communityLink.id, id)
	});

	if (!record) error(404, 'Community link not found');
	return record;
}

export async function createCommunityLink(perms: UserPermissions, input: CreateCommunityLinkInput) {
	requireCommunityManage(perms);

	const data = createCommunityLinkSchema.parse(input);
	await getCommunityCategory(perms, data.categoryId);

	const [record] = await db
		.insert(communityLink)
		.values({ ...data, isPublic: data.isPublic ?? true })
		.returning();
	return record;
}

export async function updateCommunityLink(
	perms: UserPermissions,
	id: string,
	input: UpdateCommunityLinkInput
) {
	requireCommunityManage(perms);

	const existing = await getCommunityLink(perms, id);
	const data = updateCommunityLinkSchema.parse(input);

	if (data.categoryId && data.categoryId !== existing.categoryId) {
		await getCommunityCategory(perms, data.categoryId);
	}

	const [record] = await db
		.update(communityLink)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(communityLink.id, id))
		.returning();

	return record;
}

export async function deleteCommunityLink(perms: UserPermissions, id: string) {
	requireCommunityManage(perms);

	await getCommunityLink(perms, id);
	await db.delete(communityLink).where(eq(communityLink.id, id));
}

export async function getRoleCommunityLinkIds(roleId: string): Promise<string[]> {
	const rows = await db.query.accessRoleCommunityLink.findMany({
		where: eq(accessRoleCommunityLink.roleId, roleId),
		columns: { communityLinkId: true }
	});
	return rows.map((row) => row.communityLinkId);
}

export async function setRoleCommunityLinks(roleId: string, communityLinkIds: string[]) {
	const uniqueIds = [...new Set(communityLinkIds)];

	if (uniqueIds.length > 0) {
		const existing = await db.query.communityLink.findMany({
			where: inArray(communityLink.id, uniqueIds),
			columns: { id: true }
		});
		if (existing.length !== uniqueIds.length) {
			error(400, 'One or more community links do not exist');
		}
	}

	await db.delete(accessRoleCommunityLink).where(eq(accessRoleCommunityLink.roleId, roleId));

	if (uniqueIds.length === 0) return;

	await db.insert(accessRoleCommunityLink).values(
		uniqueIds.map((communityLinkId) => ({
			roleId,
			communityLinkId
		}))
	);
}

export async function getCommunityLinkCountsByRole(): Promise<Map<string, number>> {
	const rows = await db
		.select({
			roleId: accessRoleCommunityLink.roleId,
			count: sql<number>`count(*)::int`
		})
		.from(accessRoleCommunityLink)
		.groupBy(accessRoleCommunityLink.roleId);

	return new Map(rows.map((row) => [row.roleId, row.count]));
}
