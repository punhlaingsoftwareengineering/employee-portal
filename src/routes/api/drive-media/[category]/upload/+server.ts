import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import { handleDrivePortalError, parseDriveMediaCategory } from '$lib/server/drive-media-api';
import { uploadToCategory } from '$lib/server/drive-portal-client';

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);
	const category = parseDriveMediaCategory(event.params.category);

	const form = await event.request.formData();
	const file = form.get('file');
	if (!(file instanceof File) || file.size === 0) {
		return json({ error: 'Missing file' }, { status: 400 });
	}

	const fileName = file.name.trim() || 'upload';
	const mimeType = file.type || 'application/octet-stream';
	const bytes = new Uint8Array(await file.arrayBuffer());

	try {
		const result = await uploadToCategory(category, fileName, mimeType, bytes);
		return json(result);
	} catch (e) {
		handleDrivePortalError(e);
	}
};
