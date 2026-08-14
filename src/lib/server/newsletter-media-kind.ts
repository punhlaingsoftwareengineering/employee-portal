import {
	mediaKindFromHttpHeaders,
	newsletterMediaKind,
	type NewsletterMediaKind
} from '$lib/utils/newsletter-media';
import { normalizePublicDriveUrl } from '$lib/utils/drive-public-url';
import { rewriteDriveUrlForServerFetch } from '$lib/server/drive-portal-client';

const RESOLVE_TIMEOUT_MS = 2500;

/** Resolve PDF vs image for extensionless Drive public URLs (server-side HEAD). */
export async function resolveNewsletterMediaKind(
	url: string,
	title?: string | null
): Promise<NewsletterMediaKind> {
	const normalized = normalizePublicDriveUrl(url) || url.trim();
	const fromUrl = newsletterMediaKind(normalized);
	if (fromUrl !== 'unknown') return fromUrl;

	const fromTitle = newsletterMediaKind(title ?? '');
	if (fromTitle !== 'unknown') return fromTitle;

	if (!normalized.startsWith('http')) return 'unknown';

	const rewritten = rewriteDriveUrlForServerFetch(normalized);

	try {
		const res = await fetch(rewritten.url, {
			method: 'HEAD',
			redirect: 'follow',
			headers: rewritten.headers,
			signal: AbortSignal.timeout(RESOLVE_TIMEOUT_MS)
		});
		const fromHead = mediaKindFromHttpHeaders(
			res.headers.get('content-type'),
			res.headers.get('content-disposition')
		);
		if (fromHead !== 'unknown') return fromHead;
	} catch {
		/* HEAD may be blocked; try a tiny ranged GET */
	}

	try {
		const res = await fetch(rewritten.url, {
			method: 'GET',
			redirect: 'follow',
			headers: {
				...(rewritten.headers as Record<string, string>),
				Range: 'bytes=0-0'
			},
			signal: AbortSignal.timeout(RESOLVE_TIMEOUT_MS)
		});
		const fromGet = mediaKindFromHttpHeaders(
			res.headers.get('content-type'),
			res.headers.get('content-disposition')
		);
		if (fromGet !== 'unknown') return fromGet;
	} catch {
		/* ignore */
	}

	// Newsletters are usually PDFs when uploaded via Drive without an extension in the URL.
	return 'pdf';
}
