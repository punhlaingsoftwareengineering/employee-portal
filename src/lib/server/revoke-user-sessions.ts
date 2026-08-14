import { eq, inArray } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { session } from '$lib/server/db/schema/auth.schema';

/** Delete all Better Auth sessions for one or more users (forces re-login). */
export async function revokeUserSessions(userIds: string | string[]) {
	const ids = Array.isArray(userIds) ? userIds : [userIds];
	const unique = [...new Set(ids.filter(Boolean))];
	if (unique.length === 0) return;

	if (unique.length === 1) {
		await db.delete(session).where(eq(session.userId, unique[0]));
		return;
	}

	await db.delete(session).where(inArray(session.userId, unique));
}
