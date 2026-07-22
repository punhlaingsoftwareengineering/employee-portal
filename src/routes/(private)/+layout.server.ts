import { redirect } from '@sveltejs/kit';
import { AUTH_ROUTES } from '$lib/constants/auth-routes';
import { getUserPermissions } from '$lib/server/services/portal-user';
import { getServicesForUser } from '$lib/server/services/service';
import { getAppsForUser } from '$lib/server/services/app';
import { canAccessTools, hasAppAccess } from '$lib/server/permissions';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const redirectTo = encodeURIComponent(url.pathname);
		redirect(303, `${AUTH_ROUTES.login}?redirectTo=${redirectTo}`);
	}

	const permissions = await getUserPermissions(locals.user.id);

	if (!hasAppAccess(permissions) && url.pathname !== '/pending') {
		redirect(303, '/pending');
	}

	if (hasAppAccess(permissions) && url.pathname === '/pending') {
		redirect(303, '/dashboard');
	}

	const toolsAccess = hasAppAccess(permissions) && canAccessTools(permissions);

	const availableServices = toolsAccess ? await getServicesForUser(permissions) : [];

	const availableApps = toolsAccess ? await getAppsForUser(permissions) : [];

	return { user: locals.user, permissions, availableServices, availableApps };
};
