import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import * as supportTicketService from '$lib/server/services/support-ticket';
import { updateSupportTicketStatusSchema } from '$lib/schemas/support-ticket';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAdmin(event);
	const record = await supportTicketService.getSupportTicket(perms, event.params.id!);
	return json(record);
};

export const PATCH: RequestHandler = async (event) => {
	const perms = await requireAdmin(event);
	const body = await event.request.json();
	const data = updateSupportTicketStatusSchema.parse(body);
	const record = await supportTicketService.updateSupportTicketStatus(
		perms,
		event.params.id!,
		data
	);
	return json(record);
};
