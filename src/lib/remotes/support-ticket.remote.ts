import { command, query } from '$app/server';
import { getRequestEvent } from '$app/server';
import { z } from 'zod';
import * as supportTicketService from '$lib/server/services/support-ticket';
import {
	createSupportTicketSchema,
	updateSupportTicketStatusSchema
} from '$lib/schemas/support-ticket';
import { requireAdmin, requireUser } from '$lib/server/auth-guard';

export const createSupportTicket = command(createSupportTicketSchema, async (data) => {
	const event = getRequestEvent();
	const record = await supportTicketService.createSupportTicket(event, data);

	if (event.locals.user) {
		void getMySupportTickets().refresh();
	}
	void getSupportTickets().refresh();

	return record;
});

export const getMySupportTickets = query(async () => {
	const user = requireUser(getRequestEvent());
	return supportTicketService.listMySupportTickets(user.id);
});

export const getSupportTickets = query(async () => {
	const perms = await requireAdmin(getRequestEvent());
	return supportTicketService.listSupportTickets(perms);
});

export const getSupportTicket = query(z.string().uuid(), async (id) => {
	const perms = await requireAdmin(getRequestEvent());
	return supportTicketService.getSupportTicket(perms, id);
});

export const updateSupportTicketStatus = command(
	z.object({
		id: z.string().uuid(),
		...updateSupportTicketStatusSchema.shape
	}),
	async ({ id, ...data }) => {
		const perms = await requireAdmin(getRequestEvent());
		const record = await supportTicketService.updateSupportTicketStatus(perms, id, data);
		void getSupportTickets().refresh();
		void getSupportTicket(id).refresh();
		return record;
	}
);
