import { redirect } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getUserPermissions } from '$lib/server/services/portal-user';
import { hasAppAccess } from '$lib/server/permissions';
import { redirectSafe, resolveSafeRedirectTo } from '$lib/server/safe-redirect';

export async function redirectIfAuthenticated(event: RequestEvent) {
	if (!event.locals.user) return;

	const redirectTo = resolveSafeRedirectTo(
		event.url.searchParams.get('redirectTo') ?? '/dashboard',
		event.url.origin
	);
	const permissions = await getUserPermissions(event.locals.user.id);

	if (permissions.isGuest) {
		redirect(303, '/pending');
	}

	if (!hasAppAccess(permissions)) {
		redirect(303, '/pending');
	}

	redirectSafe(303, redirectTo);
}
