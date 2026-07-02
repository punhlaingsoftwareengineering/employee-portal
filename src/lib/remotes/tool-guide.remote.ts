import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as toolGuideService from '$lib/server/services/tool-guide';
import { createToolGuideSchema, updateToolGuideSchema } from '$lib/schemas/tool-guide';
import { requireAppAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireAppAccess(getRequestEvent());
}

export const getToolGuides = query(async () => toolGuideService.listToolGuides(await perms()));

export const getToolGuide = query(z.string().uuid(), async (id) =>
	toolGuideService.getToolGuide(await perms(), id)
);

export const createToolGuide = command(createToolGuideSchema, async (data) => {
	const record = await toolGuideService.createToolGuide(await perms(), data);
	void getToolGuides().refresh();
	return record;
});

export const updateToolGuide = command(
	z.object({
		id: z.string().uuid(),
		...updateToolGuideSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await toolGuideService.updateToolGuide(await perms(), id, data);
		void getToolGuides().refresh();
		void getToolGuide(id).refresh();
		return record;
	}
);

export const deleteToolGuide = command(z.string().uuid(), async (id) => {
	await toolGuideService.deleteToolGuide(await perms(), id);
	void getToolGuides().refresh();
});
