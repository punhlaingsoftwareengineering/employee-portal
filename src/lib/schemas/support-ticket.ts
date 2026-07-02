import { z } from 'zod';
import {
	SUPPORT_TICKET_CATEGORIES,
	SUPPORT_TICKET_STATUSES,
	SUPPORT_TICKET_URGENCIES
} from '$lib/constants/support-ticket';

export const createSupportTicketSchema = z.object({
	category: z.enum(SUPPORT_TICKET_CATEGORIES),
	urgency: z.enum(SUPPORT_TICKET_URGENCIES),
	contactPhone: z.string().max(40).optional(),
	subject: z.string().min(1).max(200),
	description: z.string().min(1).max(5000),
	guestName: z.string().min(1).max(120).optional(),
	guestEmail: z.string().email().max(320).optional()
});

export const updateSupportTicketStatusSchema = z.object({
	status: z.enum(SUPPORT_TICKET_STATUSES)
});

export type CreateSupportTicketInput = z.infer<typeof createSupportTicketSchema>;
export type UpdateSupportTicketStatusInput = z.infer<typeof updateSupportTicketStatusSchema>;
