import { error, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { newsletter } from '$lib/server/db/schema/newsletter';
import { rewriteDriveUrlForServerFetch } from '$lib/server/drive-portal-client';
import { normalizePublicDriveUrl } from '$lib/utils/drive-public-url';

/**
 * Same-origin proxy for onboarding newsletter previews.
 * Fetches Drive via DRIVE_INTERNAL_ORIGIN inside Docker (not public https).
 */
export const GET: RequestHandler = async ({ params, request }) => {
	const id = params.id;
	if (!id) throw error(400, 'Missing id');

	const row = await db.query.newsletter.findFirst({
		where: eq(newsletter.id, id),
		columns: { id: true, pdfUrl: true, title: true }
	});
	if (!row) throw error(404, 'Newsletter not found');

	const publicUrl = normalizePublicDriveUrl(row.pdfUrl) || row.pdfUrl.trim();
	if (!publicUrl.startsWith('http')) throw error(400, 'Invalid media URL');

	const rewritten = rewriteDriveUrlForServerFetch(publicUrl);
	const upstreamHeaders: Record<string, string> = {
		Accept: request.headers.get('Accept') ?? '*/*',
		...(rewritten.headers as Record<string, string>)
	};
	const requestRange = request.headers.get('Range');
	if (requestRange) upstreamHeaders.Range = requestRange;

	let upstream: Response;
	try {
		upstream = await fetch(rewritten.url, {
			redirect: 'follow',
			headers: upstreamHeaders,
			signal: AbortSignal.timeout(30_000)
		});
	} catch (e) {
		console.error('[newsletter-media] upstream fetch failed', id, rewritten.url, e);
		throw error(502, 'Failed to load newsletter media');
	}

	if (!upstream.ok && upstream.status !== 206) {
		const body = await upstream.text().catch(() => '');
		console.error(
			'[newsletter-media] upstream status',
			id,
			upstream.status,
			rewritten.url,
			body.slice(0, 200)
		);
		throw error(502, 'Failed to load newsletter media');
	}

	const contentType = upstream.headers.get('Content-Type') ?? 'application/octet-stream';
	const headers = new Headers({
		'Content-Type': contentType,
		'Content-Disposition': 'inline',
		'Cache-Control': 'public, max-age=300',
		'X-Content-Type-Options': 'nosniff'
	});
	const len = upstream.headers.get('Content-Length');
	if (len) headers.set('Content-Length', len);
	const contentRange = upstream.headers.get('Content-Range');
	if (contentRange) headers.set('Content-Range', contentRange);
	if (upstream.status === 206) headers.set('Accept-Ranges', 'bytes');

	return new Response(upstream.body, {
		status: upstream.status,
		headers
	});
};
