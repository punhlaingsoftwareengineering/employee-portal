import { json, type RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { requireAdmin } from '$lib/server/auth-guard';
import { handleDrivePortalError, parseDriveMediaCategory } from '$lib/server/drive-media-api';
import { pickCategoryFile } from '$lib/server/drive-portal-client';

const bodySchema = z.object({ fileId: z.string().uuid() }).strict();

export const POST: RequestHandler = async (event) => {
	await requireAdmin(event);
	const category = parseDriveMediaCategory(event.params.category);

	let raw: unknown;
	try {
		raw = await event.request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, { status: 400 });
	}

	const parsed = bodySchema.safeParse(raw);
	if (!parsed.success) {
		return json({ error: parsed.error.message }, { status: 400 });
	}

	try {
		const result = await pickCategoryFile(category, parsed.data.fileId);
		return json(result);
	} catch (e) {
		handleDrivePortalError(e);
	}
};
