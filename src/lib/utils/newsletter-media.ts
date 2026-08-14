export type NewsletterMediaKind = 'pdf' | 'image' | 'unknown';

const IMAGE_EXT = /\.(avif|bmp|gif|jpe?g|png|svg|webp)(\?|#|$)/i;
const PDF_EXT = /\.pdf(\?|#|$)/i;

/** Infer display kind from a newsletter media URL (column remains `pdfUrl`). */
export function newsletterMediaKind(url: string): NewsletterMediaKind {
	const trimmed = url.trim();
	if (!trimmed) return 'unknown';
	if (PDF_EXT.test(trimmed)) return 'pdf';
	if (IMAGE_EXT.test(trimmed)) return 'image';
	if (/\/image\//i.test(trimmed) || /[?&](?:format|type)=image/i.test(trimmed)) return 'image';
	return 'unknown';
}

export function mediaKindFromHttpHeaders(
	contentType: string | null | undefined,
	contentDisposition: string | null | undefined
): NewsletterMediaKind {
	const type = (contentType ?? '').toLowerCase();
	if (type.includes('application/pdf') || type.includes('pdf')) return 'pdf';
	if (type.startsWith('image/')) return 'image';

	const cd = contentDisposition ?? '';
	const star = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(cd)?.[1];
	const plain = /filename\s*=\s*"([^"]+)"|filename\s*=\s*([^;]+)/i.exec(cd);
	const rawName = decodeURIComponent((star ?? plain?.[1] ?? plain?.[2] ?? '').trim());
	return newsletterMediaKind(rawName);
}

/** Drive public file links have no file extension — kind must come from headers or title. */
export function isExtensionlessPublicFileUrl(url: string): boolean {
	try {
		const path = new URL(url).pathname;
		return /\/api\/public\/files\/[^/]+$/i.test(path) || !/\.[a-z0-9]{2,5}$/i.test(path);
	} catch {
		return !PDF_EXT.test(url) && !IMAGE_EXT.test(url);
	}
}

export const NEWSLETTER_MEDIA_ACCEPT =
	'application/pdf,image/jpeg,image/png,image/webp,image/gif,image/avif';
