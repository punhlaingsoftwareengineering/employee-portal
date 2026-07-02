import { DEFAULT_APP_TITLE } from '$lib/constants/app-settings';

export const PAGE_TITLE_PREFIX_KEY = Symbol('page-title-prefix');

/** Build `Segment | … | AppName`, omitting empty segments. */
export function formatPageTitle(segments: string[], appName: string): string {
	const parts = segments.map((segment) => segment.trim()).filter(Boolean);
	parts.push(appName.trim() || DEFAULT_APP_TITLE);
	return parts.join(' | ');
}
