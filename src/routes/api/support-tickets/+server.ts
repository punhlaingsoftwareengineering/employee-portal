import { json, type RequestHandler } from '@sveltejs/kit';
import { requireAdmin } from '$lib/server/auth-guard';
import * as supportTicketService from '$lib/server/services/support-ticket';
import { createSupportTicketSchema } from '$lib/schemas/support-ticket';

export const GET: RequestHandler = async (event) => {
	const perms = await requireAdmin(event);
	const tickets = await supportTicketService.listSupportTickets(perms);
	return json(tickets);
};

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json();
	const data = createSupportTicketSchema.parse(body);
	const record = await supportTicketService.createSupportTicket(event, data);
	return json(record, { status: 201 });
};
