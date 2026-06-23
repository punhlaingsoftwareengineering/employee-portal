import { createHash, randomBytes } from 'node:crypto';
import { eq, asc, ne } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { userInvite } from '$lib/server/db/schema/user-invite';
import { user } from '$lib/server/db/schema/auth.schema';
import { userDepartmentRole } from '$lib/server/db/schema/user-department-role';
import { createInviteSchema, acceptInviteSchema } from '$lib/schemas/user-invite';
import type { CreateInviteInput, AcceptInviteInput } from '$lib/schemas/user-invite';
import { sendInviteEmail } from '$lib/server/mail';
import { ORIGIN } from '$app/env/private';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { auth } from '$lib/server/auth';

const INVITE_TTL_MS = 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

function generateToken(): string {
	return randomBytes(32).toString('base64url');
}

function inviteUrl(token: string): string {
	return `${ORIGIN}${AUTH_ROUTES.acceptInvite}?token=${encodeURIComponent(token)}`;
}

export async function listInvites() {
	return db.query.userInvite.findMany({
		where: ne(userInvite.status, 'accepted'),
		orderBy: [asc(userInvite.createdAt)],
		with: {
			invitedByUser: true,
			acceptedByUser: true
		}
	});
}

export async function createInvite(invitedBy: string, input: CreateInviteInput) {
	const data = createInviteSchema.parse(input);
	const email = data.email.toLowerCase();
	const token = generateToken();
	const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

	const [invite] = await db
		.insert(userInvite)
		.values({
			email,
			name: data.name,
			tokenHash: hashToken(token),
			expiresAt,
			invitedBy,
			status: 'pending',
			portalRole: data.inviteAsAdmin ? 'admin' : 'member',
			assignments: data.inviteAsAdmin ? [] : data.assignments
		})
		.returning();

	sendInviteEmail({ email, name: data.name, inviteUrl: inviteUrl(token) });

	return invite;
}

export async function resendInvite(inviteId: string) {
	const invite = await db.query.userInvite.findFirst({
		where: eq(userInvite.id, inviteId)
	});

	if (!invite) error(404, 'Invite not found');
	if (invite.status === 'accepted') error(400, 'Invite already accepted');

	const token = generateToken();
	const expiresAt = new Date(Date.now() + INVITE_TTL_MS);

	const [updated] = await db
		.update(userInvite)
		.set({
			tokenHash: hashToken(token),
			expiresAt,
			status: 'pending',
			updatedAt: new Date()
		})
		.where(eq(userInvite.id, inviteId))
		.returning();

	sendInviteEmail({ email: invite.email, name: invite.name, inviteUrl: inviteUrl(token) });

	return updated;
}

export async function revokeInvite(inviteId: string) {
	const invite = await db.query.userInvite.findFirst({
		where: eq(userInvite.id, inviteId)
	});

	if (!invite) error(404, 'Invite not found');
	if (invite.status === 'accepted') error(400, 'Invite already accepted');

	await db
		.update(userInvite)
		.set({ status: 'revoked', updatedAt: new Date() })
		.where(eq(userInvite.id, inviteId));
}

export async function getInviteByToken(token: string) {
	const invite = await db.query.userInvite.findFirst({
		where: eq(userInvite.tokenHash, hashToken(token))
	});

	if (!invite) return null;

	if (invite.status !== 'pending') {
		return { invite, valid: false as const, reason: 'used' as const };
	}

	if (invite.expiresAt <= new Date()) {
		await db
			.update(userInvite)
			.set({ status: 'expired', updatedAt: new Date() })
			.where(eq(userInvite.id, invite.id));
		return { invite, valid: false as const, reason: 'expired' as const };
	}

	return { invite, valid: true as const };
}

export async function acceptInvite(input: AcceptInviteInput, headers: Headers) {
	const data = acceptInviteSchema.parse(input);
	const result = await getInviteByToken(data.token);

	if (!result || !result.valid) {
		error(400, 'This invite link is invalid or has expired.');
	}

	const { invite } = result;
	const email = invite.email.toLowerCase();

	const existingUser = await db.query.user.findFirst({
		where: eq(user.email, email)
	});

	if (existingUser) {
		error(400, 'An account with this email already exists. Sign in instead.');
	}

	await auth.api.signUpEmail({
		body: {
			email,
			password: data.password,
			name: invite.name,
			callbackURL: AUTH_ROUTES.verificationSuccess
		},
		headers
	});

	const createdUser = await db.query.user.findFirst({
		where: eq(user.email, email)
	});

	if (!createdUser) {
		error(500, 'Could not create user account');
	}

	await db
		.update(user)
		.set({ emailVerified: true, updatedAt: new Date() })
		.where(eq(user.id, createdUser.id));

	if (invite.portalRole === 'member' && invite.assignments.length > 0) {
		await db.insert(userDepartmentRole).values(
			invite.assignments.map((assignment) => ({
				userId: createdUser.id,
				departmentId: assignment.departmentId,
				roleId: assignment.roleId,
				facilityId: assignment.facilityId
			}))
		);
	}

	await db
		.update(userInvite)
		.set({
			status: 'accepted',
			acceptedByUserId: createdUser.id,
			updatedAt: new Date()
		})
		.where(eq(userInvite.id, invite.id));

	await auth.api.signInEmail({
		body: { email, password: data.password },
		headers
	});

	return createdUser;
}
