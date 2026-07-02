import { desc, eq } from 'drizzle-orm';
import { error, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { supportTicket } from '$lib/server/db/schema/support-ticket';
import {
	createSupportTicketSchema,
	updateSupportTicketStatusSchema,
	type CreateSupportTicketInput,
	type UpdateSupportTicketStatusInput
} from '$lib/schemas/support-ticket';
import type { UserPermissions } from '$lib/server/permissions';

const ticketOrder = [desc(supportTicket.createdAt)];

function ticketValues(data: CreateSupportTicketInput) {
	return {
		category: data.category,
		urgency: data.urgency,
		contactPhone: data.contactPhone?.trim() || null,
		subject: data.subject.trim(),
		description: data.description.trim()
	};
}

function requireAdmin(perms: UserPermissions) {
	if (!perms.isAdmin) error(403, 'Forbidden');
}

export async function createSupportTicket(event: RequestEvent, input: CreateSupportTicketInput) {
	const user = event.locals.user ?? null;
	const data = createSupportTicketSchema.parse(input);

	if (!user) {
		const guestName = data.guestName?.trim();
		const guestEmail = data.guestEmail?.trim();
		if (!guestName || !guestEmail) {
			error(400, 'Name and email are required for guest tickets');
		}

		const [record] = await db
			.insert(supportTicket)
			.values({
				guestName,
				guestEmail,
				...ticketValues(data)
			})
			.returning();

		return record;
	}

	const [record] = await db
		.insert(supportTicket)
		.values({
			userId: user.id,
			...ticketValues(data)
		})
		.returning();

	return record;
}

export async function listMySupportTickets(userId: string) {
	return db.query.supportTicket.findMany({
		where: eq(supportTicket.userId, userId),
		orderBy: ticketOrder
	});
}

export async function listSupportTickets(perms: UserPermissions) {
	requireAdmin(perms);

	return db.query.supportTicket.findMany({
		orderBy: ticketOrder,
		with: {
			user: {
				columns: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});
}

export async function getSupportTicket(perms: UserPermissions, id: string) {
	requireAdmin(perms);

	const record = await db.query.supportTicket.findFirst({
		where: eq(supportTicket.id, id),
		with: {
			user: {
				columns: {
					id: true,
					name: true,
					email: true
				}
			}
		}
	});

	if (!record) error(404, 'Support ticket not found');
	return record;
}

export async function updateSupportTicketStatus(
	perms: UserPermissions,
	id: string,
	input: UpdateSupportTicketStatusInput
) {
	requireAdmin(perms);

	await getSupportTicket(perms, id);
	const data = updateSupportTicketStatusSchema.parse(input);

	const [record] = await db
		.update(supportTicket)
		.set({ status: data.status, updatedAt: new Date() })
		.where(eq(supportTicket.id, id))
		.returning();

	return record;
}
