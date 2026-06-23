import { z } from 'zod';
import { PORTAL_ROLES } from '$lib/constants/user-roles';

export const portalRoleSchema = z.enum(PORTAL_ROLES);

export const departmentRoleAssignmentSchema = z.object({
	departmentId: z.string().uuid(),
	roleId: z.string().uuid(),
	facilityId: z.string().uuid()
});

export const updateUserAccessSchema = z.object({
	userId: z.string().min(1),
	portalRole: z.enum(['admin', 'guest', 'member']),
	assignments: z.array(departmentRoleAssignmentSchema).default([])
});

export type UpdateUserAccessInput = z.infer<typeof updateUserAccessSchema>;
