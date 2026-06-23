import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserPermissions } from '$lib/server/services/portal-user';
import { canUserAccessService } from '$lib/server/services/service';
import { proxyServiceRequest } from '$lib/server/services/service-proxy';

async function authorize(event: Parameters<RequestHandler>[0]) {
	if (!event.locals.user) error(401, 'Unauthorized');

	const permissions = await getUserPermissions(event.locals.user.id);
	const serviceId = event.params.id;
	if (!serviceId || !(await canUserAccessService(permissions, serviceId))) {
		error(403, 'You do not have access to this service');
	}
}

const handler =
	(method: string): RequestHandler =>
	async (event) => {
		await authorize(event);
		return proxyServiceRequest(event, method);
	};

export const GET = handler('GET');
export const HEAD = handler('HEAD');
export const POST = handler('POST');
export const PUT = handler('PUT');
export const PATCH = handler('PATCH');
export const DELETE = handler('DELETE');
export const OPTIONS = handler('OPTIONS');
