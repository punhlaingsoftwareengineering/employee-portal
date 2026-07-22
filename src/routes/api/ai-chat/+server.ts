import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAppAccess } from '$lib/server/auth-guard';
import { aiChatRequestSchema } from '$lib/schemas/ai-chat';
import { generateAiAssistantReply } from '$lib/server/services/ai-assistant';

export const POST: RequestHandler = async (event) => {
	await requireAppAccess(event);

	const body = await event.request.json();
	const { message, history } = aiChatRequestSchema.parse(body);
	const reply = generateAiAssistantReply(message, history);
	return json(reply);
};
