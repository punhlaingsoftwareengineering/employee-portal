import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import { handleDrivePortalError, parseDriveMediaCategory } from '$lib/server/drive-media-api';
import { listCategoryFiles } from '$lib/server/drive-portal-client';

export const GET: RequestHandler = async (event) => {
	await requireAdmin(event);
	const category = parseDriveMediaCategory(event.params.category);
	try {
		const files = await listCategoryFiles(category);
		return json({ files });
	} catch (e) {
		handleDrivePortalError(e);
	}
};
