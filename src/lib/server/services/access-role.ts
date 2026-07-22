import { eq, asc, count } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { accessRole } from '$lib/server/db/schema/access-role';
import { userDepartmentRole } from '$lib/server/db/schema/user-department-role';
import {
	createAccessRoleSchema,
	updateAccessRoleSchema,
	type CreateAccessRoleInput,
	type UpdateAccessRoleInput
} from '$lib/schemas/access-role';
import { getServiceCountsByRole, setRoleServices } from '$lib/server/services/service';
import { getAppCountsByRole, setRoleApps } from '$lib/server/services/app';
import {
	getCommunityLinkCountsByRole,
	setRoleCommunityLinks
} from '$lib/server/services/community-link';
import { slugifyName } from '$lib/utils/slug';

const DEFAULT_ROLES: CreateAccessRoleInput[] = [
	{
		name: 'Manager',
		slug: 'manager',
		description: 'Full employee CRUD in assigned departments; read-only elsewhere.',
		navDashboard: true,
		navEmployees: true,
		navDepartments: true,
		navFacilities: true,
		navPharmacy: true,
		navTools: true,
		navSettings: false,
		navCommunity: false,
		employeeReadAll: true,
		employeeWrite: true,
		employeeDelete: true,
		departmentReadAll: true,
		departmentWrite: false,
		facilityReadAll: true,
		facilityWrite: false,
		pharmacyReadAll: true,
		pharmacyWrite: true
	},
	{
		name: 'HR',
		slug: 'hr',
		description: 'Manage employees in assigned departments only.',
		navDashboard: true,
		navEmployees: true,
		navDepartments: true,
		navFacilities: true,
		navPharmacy: true,
		navTools: true,
		navSettings: false,
		navCommunity: false,
		employeeReadAll: false,
		employeeWrite: true,
		employeeDelete: true,
		departmentReadAll: false,
		departmentWrite: false,
		facilityReadAll: false,
		facilityWrite: false,
		pharmacyReadAll: false,
		pharmacyWrite: false
	},
	{
		name: 'Viewer',
		slug: 'viewer',
		description: 'Read-only access in assigned departments.',
		navDashboard: true,
		navEmployees: true,
		navDepartments: true,
		navFacilities: true,
		navPharmacy: true,
		navTools: true,
		navSettings: false,
		navCommunity: false,
		employeeReadAll: false,
		employeeWrite: false,
		employeeDelete: false,
		departmentReadAll: false,
		departmentWrite: false,
		facilityReadAll: true,
		facilityWrite: false,
		pharmacyReadAll: true,
		pharmacyWrite: false
	}
];

async function resolveUniqueSlug(base: string, excludeId?: string): Promise<string> {
	const normalized = slugifyName(base);
	let candidate = normalized;
	let suffix = 2;

	while (true) {
		const taken = await db.query.accessRole.findFirst({
			where: eq(accessRole.slug, candidate),
			columns: { id: true }
		});
		if (!taken || (excludeId && taken.id === excludeId)) {
			return candidate;
		}
		const tail = `-${suffix++}`;
		candidate = `${normalized.slice(0, Math.max(1, 40 - tail.length))}${tail}`;
	}
}

export async function ensureDefaultAccessRoles() {
	const existing = await db.query.accessRole.findMany();
	if (existing.length > 0) return existing;

	await db.insert(accessRole).values(
		DEFAULT_ROLES.map((role) => ({
			...role,
			slug: role.slug ?? slugifyName(role.name),
			isSystem: true
		}))
	);

	return db.query.accessRole.findMany({ orderBy: [asc(accessRole.name)] });
}

export async function listRolesForAssignment() {
	await ensureDefaultAccessRoles();
	return db.query.accessRole.findMany({ orderBy: [asc(accessRole.name)] });
}

export async function listAccessRoles() {
	await ensureDefaultAccessRoles();
	const roles = await db.query.accessRole.findMany({ orderBy: [asc(accessRole.name)] });
	const serviceCounts = await getServiceCountsByRole();
	const appCounts = await getAppCountsByRole();
	const communityLinkCounts = await getCommunityLinkCountsByRole();

	return roles.map((role) => ({
		...role,
		serviceCount: serviceCounts.get(role.id) ?? 0,
		appCount: appCounts.get(role.id) ?? 0,
		communityLinkCount: communityLinkCounts.get(role.id) ?? 0,
		toolCount:
			(serviceCounts.get(role.id) ?? 0) +
			(appCounts.get(role.id) ?? 0) +
			(communityLinkCounts.get(role.id) ?? 0)
	}));
}

export async function getAccessRole(id: string) {
	const record = await db.query.accessRole.findFirst({
		where: eq(accessRole.id, id)
	});
	if (!record) error(404, 'Role not found');
	return record;
}

export async function createAccessRole(input: CreateAccessRoleInput) {
	const data = createAccessRoleSchema.parse(input);
	const { serviceIds, appIds, communityLinkIds, slug: _slug, ...roleData } = data;
	const slug = await resolveUniqueSlug(roleData.name);

	const [record] = await db
		.insert(accessRole)
		.values({ ...roleData, slug })
		.returning();

	if (serviceIds) {
		await setRoleServices(record.id, serviceIds);
	}

	if (appIds) {
		await setRoleApps(record.id, appIds);
	}

	if (communityLinkIds) {
		await setRoleCommunityLinks(record.id, communityLinkIds);
	}

	return record;
}

export async function updateAccessRole(input: UpdateAccessRoleInput) {
	const data = updateAccessRoleSchema.parse(input);
	const existing = await getAccessRole(data.id);

	const { id, serviceIds, appIds, communityLinkIds, slug: _slug, ...rest } = data;
	const patch: Record<string, unknown> = { ...rest };

	if (
		data.name !== undefined &&
		data.name !== existing.name &&
		!existing.isSystem
	) {
		patch.slug = await resolveUniqueSlug(data.name, id);
	}

	const [record] = await db
		.update(accessRole)
		.set({ ...patch, updatedAt: new Date() })
		.where(eq(accessRole.id, id))
		.returning();

	if (serviceIds !== undefined) {
		await setRoleServices(id, serviceIds);
	}

	if (appIds !== undefined) {
		await setRoleApps(id, appIds);
	}

	if (communityLinkIds !== undefined) {
		await setRoleCommunityLinks(id, communityLinkIds);
	}

	return record;
}

export async function deleteAccessRole(id: string) {
	const existing = await getAccessRole(id);

	const [usage] = await db
		.select({ value: count() })
		.from(userDepartmentRole)
		.where(eq(userDepartmentRole.roleId, id));

	if ((usage?.value ?? 0) > 0) {
		error(400, 'Cannot delete a role that is assigned to users');
	}

	if (existing.isSystem) {
		error(400, 'System roles cannot be deleted');
	}

	await db.delete(accessRole).where(eq(accessRole.id, id));
}

export async function getAccessRoleBySlug(slug: string) {
	await ensureDefaultAccessRoles();
	return db.query.accessRole.findFirst({
		where: eq(accessRole.slug, slug)
	});
}
