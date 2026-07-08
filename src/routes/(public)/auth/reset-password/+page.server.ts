import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { auth } from '$lib/server/auth';
import { APIError } from 'better-auth/api';

export const load: PageServerLoad = ({ url }) => {
	const token = url.searchParams.get('token');
	const error = url.searchParams.get('error');

	if (error) {
		return { token: null, error: 'This reset link is invalid or has expired.' };
	}

	return { token, error: null };
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const password = formData.get('password')?.toString() ?? '';
		const confirmPassword = formData.get('confirmPassword')?.toString() ?? '';
		const token =
			formData.get('token')?.toString() ?? event.url.searchParams.get('token')?.toString() ?? '';

		if (!token) {
			return fail(400, { message: 'Missing reset token' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		try {
			await auth.api.resetPassword({
				body: { newPassword: password, token },
				headers: event.request.headers
			});
		} catch (err) {
			if (err instanceof APIError) {
				return fail(400, { message: err.message || 'Could not reset password' });
			}
			return fail(500, { message: 'Unexpected error' });
		}

		redirect(303, AUTH_ROUTES.login);
	}
};
