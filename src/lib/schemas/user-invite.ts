import { z } from 'zod';
import { departmentRoleAssignmentSchema } from '$lib/schemas/portal-user';

export const createInviteSchema = z
	.object({
		name: z.string().min(1).max(100),
		email: z.string().email(),
		inviteAsAdmin: z.boolean().default(false),
		assignments: z.array(departmentRoleAssignmentSchema).default([])
	})
	.superRefine((data, ctx) => {
		if (data.inviteAsAdmin) return;

		if (data.assignments.length === 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: 'Select at least one role, department, and facility assignment',
				path: ['assignments']
			});
		}
	});

export const acceptInviteSchema = z
	.object({
		token: z.string().min(1),
		password: z.string().min(8),
		confirmPassword: z.string().min(8)
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;
export type AcceptInviteInput = z.infer<typeof acceptInviteSchema>;
