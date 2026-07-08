import { eq, asc, inArray, sql, and } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { app } from '$lib/server/db/schema/app';
import { accessRoleApp } from '$lib/server/db/schema/access-role-app';
import type { AppSummary } from '$lib/schemas/app';
import {
	createAppSchema,
	updateAppSchema,
	type CreateAppInput,
	type UpdateAppInput
} from '$lib/schemas/app';
import type { UserPermissions } from '$lib/server/permissions';
import { normalizeDownloadUrls } from '$lib/utils/app-download';

function normalizeScreenshotUrls(urls: string[] | undefined): string[] {
	return urls ?? [];
}

export async function listApps() {
	return db.query.app.findMany({ orderBy: [asc(app.name)] });
}

async function listPublicAppRows() {
	return db.query.app.findMany({
		where: eq(app.isPublic, true),
		orderBy: [asc(app.name)]
	});
}

export async function listPublicApps(): Promise<AppSummary[]> {
	const rows = await listPublicAppRows();
	return rows.map(toAppSummary);
}

function toAppSummary(row: typeof app.$inferSelect): AppSummary {
	return {
		id: row.id,
		name: row.name,
		tagline: row.tagline,
		description: row.description,
		iconUrl: row.iconUrl,
		bannerUrl: row.bannerUrl,
		downloadUrl: row.downloadUrl,
		downloadUrls: normalizeDownloadUrls(row.downloadUrls),
		version: row.version,
		developer: row.developer,
		category: row.category,
		screenshotUrls: row.screenshotUrls ?? [],
		isPublic: row.isPublic
	};
}

function mergeAppsByName(...lists: (typeof app.$inferSelect)[][]): (typeof app.$inferSelect)[] {
	const seen = new Set<string>();
	const results: (typeof app.$inferSelect)[] = [];

	for (const list of lists) {
		for (const item of list) {
			if (seen.has(item.id)) continue;
			seen.add(item.id);
			results.push(item);
		}
	}

	return results.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getApp(id: string) {
	const record = await db.query.app.findFirst({
		where: eq(app.id, id)
	});
	if (!record) error(404, 'App not found');
	return record;
}

export async function createApp(input: CreateAppInput) {
	const data = createAppSchema.parse(input);
	const { screenshotUrls, downloadUrls, isPublic, ...rest } = data;
	const [record] = await db
		.insert(app)
		.values({
			...rest,
			isPublic: isPublic ?? false,
			downloadUrls: normalizeDownloadUrls(downloadUrls),
			screenshotUrls: normalizeScreenshotUrls(screenshotUrls)
		})
		.returning();
	return record;
}

export async function updateApp(input: UpdateAppInput) {
	const data = updateAppSchema.parse(input);
	await getApp(data.id);

	const { id, screenshotUrls, downloadUrls, ...patch } = data;
	const [record] = await db
		.update(app)
		.set({
			...patch,
			...(downloadUrls !== undefined
				? { downloadUrls: normalizeDownloadUrls(downloadUrls) }
				: {}),
			...(screenshotUrls !== undefined
				? { screenshotUrls: normalizeScreenshotUrls(screenshotUrls) }
				: {}),
			updatedAt: new Date()
		})
		.where(eq(app.id, id))
		.returning();

	return record;
}

export async function deleteApp(id: string) {
	await getApp(id);
	await db.delete(app).where(eq(app.id, id));
}

export async function getRoleAppIds(roleId: string): Promise<string[]> {
	const rows = await db.query.accessRoleApp.findMany({
		where: eq(accessRoleApp.roleId, roleId),
		columns: { appId: true }
	});
	return rows.map((row) => row.appId);
}

export async function setRoleApps(roleId: string, appIds: string[]) {
	const uniqueIds = [...new Set(appIds)];

	if (uniqueIds.length > 0) {
		const existing = await db.query.app.findMany({
			where: inArray(app.id, uniqueIds),
			columns: { id: true }
		});
		if (existing.length !== uniqueIds.length) {
			error(400, 'One or more apps do not exist');
		}
	}

	await db.delete(accessRoleApp).where(eq(accessRoleApp.roleId, roleId));

	if (uniqueIds.length === 0) return;

	await db.insert(accessRoleApp).values(
		uniqueIds.map((appId) => ({
			roleId,
			appId
		}))
	);
}

export async function getAppCountsByRole(): Promise<Map<string, number>> {
	const rows = await db
		.select({
			roleId: accessRoleApp.roleId,
			count: sql<number>`count(*)::int`
		})
		.from(accessRoleApp)
		.groupBy(accessRoleApp.roleId);

	return new Map(rows.map((row) => [row.roleId, row.count]));
}

export async function getAppsForUser(permissions: UserPermissions) {
	if (permissions.isAdmin) {
		return listApps();
	}

	const publicApps = await listPublicAppRows();

	const roleIds = [...new Set(permissions.departmentRoles.map((assignment) => assignment.roleId))];
	if (roleIds.length === 0) return publicApps;

	const assignments = await db.query.accessRoleApp.findMany({
		where: inArray(accessRoleApp.roleId, roleIds),
		with: { app: true }
	});

	const roleApps = assignments.map((assignment) => assignment.app);
	return mergeAppsByName(publicApps, roleApps);
}

export async function canUserAccessApp(permissions: UserPermissions, appId: string): Promise<boolean> {
	const record = await db.query.app.findFirst({
		where: eq(app.id, appId),
		columns: { id: true, isPublic: true }
	});
	if (!record) return false;
	if (record.isPublic) return true;
	if (permissions.isAdmin) return true;

	const roleIds = [...new Set(permissions.departmentRoles.map((assignment) => assignment.roleId))];
	if (roleIds.length === 0) return false;

	const assignment = await db.query.accessRoleApp.findFirst({
		where: and(eq(accessRoleApp.appId, appId), inArray(accessRoleApp.roleId, roleIds)),
		columns: { appId: true }
	});

	return assignment !== undefined;
}

export async function getPublicApp(id: string) {
	const record = await getApp(id);
	if (!record.isPublic) error(404, 'App not found');
	return record;
}

export async function getAppForUser(permissions: UserPermissions, appId: string) {
	if (!(await canUserAccessApp(permissions, appId))) {
		error(403, 'You do not have access to this app');
	}
	return getApp(appId);
}
