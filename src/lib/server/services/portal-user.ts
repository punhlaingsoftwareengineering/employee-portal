import { eq, asc, and, gt, count } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { userProfile } from '$lib/server/db/schema/user-profile';
import { userDepartmentRole } from '$lib/server/db/schema/user-department-role';
import { userInvite } from '$lib/server/db/schema/user-invite';
import { user } from '$lib/server/db/schema/auth.schema';
import type { UserPermissions } from '$lib/server/permissions';
import type { PortalRole } from '$lib/constants/user-roles';
import type { UpdateUserAccessInput } from '$lib/schemas/portal-user';

export async function getUserPermissions(userId: string): Promise<UserPermissions> {
	const profile = await db.query.userProfile.findFirst({
		where: eq(userProfile.userId, userId)
	});

	const portalRole: PortalRole = profile?.portalRole ?? 'guest';

	const departmentRoles = await db.query.userDepartmentRole.findMany({
		where: eq(userDepartmentRole.userId, userId),
		with: { department: true, role: true, facility: true },
		orderBy: [asc(userDepartmentRole.createdAt)]
	});

	return {
		userId,
		portalRole,
		isAdmin: portalRole === 'admin',
		isGuest: portalRole === 'guest',
		departmentRoles: departmentRoles.map((assignment) => ({
			departmentId: assignment.departmentId,
			roleId: assignment.roleId,
			facilityId: assignment.facilityId,
			roleName: assignment.role.name,
			roleSlug: assignment.role.slug,
			permissions: {
				navDashboard: assignment.role.navDashboard,
				navEmployees: assignment.role.navEmployees,
				navDepartments: assignment.role.navDepartments,
				navFacilities: assignment.role.navFacilities,
				navTools: assignment.role.navTools,
				navSettings: assignment.role.navSettings,
				employeeReadAll: assignment.role.employeeReadAll,
				employeeWrite: assignment.role.employeeWrite,
				employeeDelete: assignment.role.employeeDelete,
				departmentReadAll: assignment.role.departmentReadAll,
				departmentWrite: assignment.role.departmentWrite,
				facilityReadAll: assignment.role.facilityReadAll,
				facilityWrite: assignment.role.facilityWrite
			}
		}))
	};
}

export async function countUsers(): Promise<number> {
	const [result] = await db.select({ value: count() }).from(user);
	return result?.value ?? 0;
}

export async function createUserProfile(userId: string, portalRole: PortalRole) {
	await db.insert(userProfile).values({ userId, portalRole });
}

export async function listPortalUsers() {
	return db.query.user.findMany({
		orderBy: [asc(user.name)],
		with: {
			profile: true,
			departmentRoles: {
				with: { department: true, role: true, facility: true },
				orderBy: [asc(userDepartmentRole.createdAt)]
			}
		}
	});
}

export async function updateUserAccess(input: UpdateUserAccessInput) {
	const existing = await db.query.user.findFirst({
		where: eq(user.id, input.userId)
	});

	if (!existing) {
		throw new Error('User not found');
	}

	const profile = await db.query.userProfile.findFirst({
		where: eq(userProfile.userId, input.userId)
	});

	if (!profile) {
		await db.insert(userProfile).values({
			userId: input.userId,
			portalRole: input.portalRole
		});
	} else {
		await db
			.update(userProfile)
			.set({ portalRole: input.portalRole, updatedAt: new Date() })
			.where(eq(userProfile.userId, input.userId));
	}

	await db.delete(userDepartmentRole).where(eq(userDepartmentRole.userId, input.userId));

	if (input.portalRole === 'member' && input.assignments.length > 0) {
		await db.insert(userDepartmentRole).values(
			input.assignments.map((assignment) => ({
				userId: input.userId,
				departmentId: assignment.departmentId,
				roleId: assignment.roleId,
				facilityId: assignment.facilityId
			}))
		);
	}

	return getUserPermissions(input.userId);
}

export async function hasPendingInviteForEmail(email: string): Promise<boolean> {
	const invite = await findValidPendingInviteByEmail(email);
	return !!invite;
}

export async function findValidPendingInviteByEmail(email: string) {
	const now = new Date();
	return db.query.userInvite.findFirst({
		where: and(
			eq(userInvite.email, email.toLowerCase()),
			eq(userInvite.status, 'pending'),
			gt(userInvite.expiresAt, now)
		)
	});
}
