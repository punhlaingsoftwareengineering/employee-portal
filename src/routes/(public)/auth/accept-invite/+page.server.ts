import { fail, redirect, isHttpError } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { getInviteByToken, acceptInvite } from '$lib/server/services/user-invite';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');

	if (!token) {
		return { token: null, inviteName: null, inviteEmail: null, error: 'Missing invite token' };
	}

	const result = await getInviteByToken(token);

	if (!result || !result.valid) {
		return {
			token: null,
			inviteName: null,
			inviteEmail: null,
			error: 'This invite link is invalid or has expired.'
		};
	}

	return {
		token,
		inviteName: result.invite.name,
		inviteEmail: result.invite.email,
		error: null
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';
		const token =
			formData.get('token')?.toString() ?? event.url.searchParams.get('token')?.toString() ?? '';

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		try {
			await acceptInvite({ token, password, confirmPassword }, event.request.headers);
		} catch (err) {
			if (isHttpError(err)) {
				const message = typeof err.body === 'string' ? err.body : err.body.message;
				return fail(err.status, { message });
			}
			if (err instanceof APIError) {
				return fail(400, { message: err.message || 'Could not accept invite' });
			}

			return fail(500, { message: 'Unexpected error' });
		}

		redirect(303, '/dashboard');
	}
};
