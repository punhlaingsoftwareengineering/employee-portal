import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import { handleDrivePortalError, parseDriveMediaCategory } from '$lib/server/drive-media-api';
import { trashCategoryFile } from '$lib/server/drive-portal-client';

export const DELETE: RequestHandler = async (event) => {
	await requireAdmin(event);
	parseDriveMediaCategory(event.params.category);
	const fileId = event.params.fileId;
	if (!fileId) {
		return json({ error: 'Missing file id' }, { status: 400 });
	}

	try {
		await trashCategoryFile(fileId);
		return json({ ok: true });
	} catch (e) {
		handleDrivePortalError(e);
	}
};
