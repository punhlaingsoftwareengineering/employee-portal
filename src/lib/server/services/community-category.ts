import { asc, eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { communityCategory } from '$lib/server/db/schema/community-category';
import { communityLink } from '$lib/server/db/schema/community-link';
import {
	createCommunityCategorySchema,
	updateCommunityCategorySchema,
	type CreateCommunityCategoryInput,
	type UpdateCommunityCategoryInput
} from '$lib/schemas/community-category';
import { canManageCommunity, type UserPermissions } from '$lib/server/permissions';
import { getCommunityLinksForViewer } from '$lib/server/services/community-link';

const categoryOrder = [asc(communityCategory.sortOrder), asc(communityCategory.createdAt)];
const linkOrder = [asc(communityLink.sortOrder), asc(communityLink.createdAt)];

function requireCommunityManage(perms: UserPermissions) {
	if (!canManageCommunity(perms)) error(403, 'Forbidden');
}

async function listCommunitySectionsWithLinks(
	visibleLinks: Awaited<ReturnType<typeof getCommunityLinksForViewer>>
) {
	const visibleIds = new Set(visibleLinks.map((link) => link.id));
	const categories = await db.query.communityCategory.findMany({
		orderBy: categoryOrder,
		with: {
			links: {
				orderBy: linkOrder
			}
		}
	});

	return categories
		.map((category) => ({
			...category,
			links: category.links.filter((link) => visibleIds.has(link.id))
		}))
		.filter((category) => category.links.length > 0);
}

export async function listPublicCommunitySections() {
	return listCommunitySectionsWithLinks(await getCommunityLinksForViewer(null));
}

export async function listCommunitySectionsForViewer(permissions: UserPermissions | null) {
	return listCommunitySectionsWithLinks(await getCommunityLinksForViewer(permissions));
}

export async function listCommunityCategories(_perms: UserPermissions) {
	return db.query.communityCategory.findMany({
		orderBy: categoryOrder,
		with: {
			links: {
				orderBy: linkOrder
			}
		}
	});
}

export async function getCommunityCategory(perms: UserPermissions, id: string) {
	const record = await db.query.communityCategory.findFirst({
		where: eq(communityCategory.id, id),
		with: {
			links: {
				orderBy: linkOrder
			}
		}
	});

	if (!record) error(404, 'Community category not found');
	return record;
}

export async function createCommunityCategory(
	perms: UserPermissions,
	input: CreateCommunityCategoryInput
) {
	requireCommunityManage(perms);

	const data = createCommunityCategorySchema.parse(input);
	const [record] = await db.insert(communityCategory).values(data).returning();
	return record;
}

export async function updateCommunityCategory(
	perms: UserPermissions,
	id: string,
	input: UpdateCommunityCategoryInput
) {
	requireCommunityManage(perms);

	await getCommunityCategory(perms, id);
	const data = updateCommunityCategorySchema.parse(input);

	const [record] = await db
		.update(communityCategory)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(communityCategory.id, id))
		.returning();

	return record;
}

export async function deleteCommunityCategory(perms: UserPermissions, id: string) {
	requireCommunityManage(perms);

	await getCommunityCategory(perms, id);
	await db.delete(communityCategory).where(eq(communityCategory.id, id));
}
