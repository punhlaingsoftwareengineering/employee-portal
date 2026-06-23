import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getUserPermissions } from '$lib/server/services/portal-user';
import { hasAppAccess } from '$lib/server/permissions';

export async function redirectIfAuthenticated(event: RequestEvent) {
	if (!event.locals.user) return;

	const redirectTo = event.url.searchParams.get('redirectTo');
	const permissions = await getUserPermissions(event.locals.user.id);

	if (permissions.isGuest) {
		redirect(303, '/pending');
	}

	if (!hasAppAccess(permissions)) {
		redirect(303, '/pending');
	}

	redirect(303, redirectTo ?? '/dashboard');
}
