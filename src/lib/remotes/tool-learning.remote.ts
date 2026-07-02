import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as toolLearningService from '$lib/server/services/tool-learning';
import { createToolLearningSchema, updateToolLearningSchema } from '$lib/schemas/tool-learning';
import { requireAppAccess } from '$lib/server/auth-guard';

async function perms() {
	return requireAppAccess(getRequestEvent());
}

export const getToolLearnings = query(async () =>
	toolLearningService.listToolLearnings(await perms())
);

export const getToolLearning = query(z.string().uuid(), async (id) =>
	toolLearningService.getToolLearning(await perms(), id)
);

export const createToolLearning = command(createToolLearningSchema, async (data) => {
	const record = await toolLearningService.createToolLearning(await perms(), data);
	void getToolLearnings().refresh();
	return record;
});

export const updateToolLearning = command(
	z.object({
		id: z.string().uuid(),
		...updateToolLearningSchema.shape
	}),
	async ({ id, ...data }) => {
		const record = await toolLearningService.updateToolLearning(await perms(), id, data);
		void getToolLearnings().refresh();
		void getToolLearning(id).refresh();
		return record;
	}
);

export const deleteToolLearning = command(z.string().uuid(), async (id) => {
	await toolLearningService.deleteToolLearning(await perms(), id);
	void getToolLearnings().refresh();
});
