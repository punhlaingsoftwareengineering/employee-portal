import { browser } from '$app/environment';
import {
	APP_DOWNLOAD_PLATFORMS,
	type AppDownloadPlatform,
	type AppDownloadUrls
} from '$lib/constants/app-download';

export function normalizeDownloadUrls(urls: AppDownloadUrls | null | undefined): AppDownloadUrls {
	if (!urls) return {};

	const normalized: AppDownloadUrls = {};
	for (const platform of APP_DOWNLOAD_PLATFORMS) {
		const url = urls[platform]?.trim();
		if (url) normalized[platform] = url;
	}
	return normalized;
}

export function listDownloadEntries(
	urls: AppDownloadUrls | null | undefined,
	legacyUrl?: string | null
): { platform: AppDownloadPlatform; url: string }[] {
	const normalized = normalizeDownloadUrls(urls);
	const entries = APP_DOWNLOAD_PLATFORMS.filter((platform) => normalized[platform]).map(
		(platform) => ({
			platform,
			url: normalized[platform]!
		})
	);

	if (entries.length === 0 && legacyUrl?.trim()) {
		return [{ platform: 'linux', url: legacyUrl.trim() }];
	}

	return entries;
}

export function detectDownloadPlatform(): AppDownloadPlatform | null {
	if (!browser) return null;

	const uaData = navigator.userAgentData;
	if (uaData?.platform) {
		const platform = uaData.platform.toLowerCase();
		if (platform.includes('win')) return 'windows';
		if (platform.includes('mac')) return 'macos';
		if (platform.includes('android')) return 'android';
		if (platform.includes('linux')) return 'linux';
	}

	const ua = navigator.userAgent;
	if (/Android/i.test(ua)) return 'android';
	if (/Windows/i.test(ua)) return 'windows';
	if (/Macintosh|Mac OS X/i.test(ua)) return 'macos';
	if (/Linux/i.test(ua)) return 'linux';

	return null;
}

export type AppDownloadEntry = { platform: AppDownloadPlatform; url: string };

export function orderDownloadsForPlatform(
	entries: AppDownloadEntry[],
	preferredPlatform: AppDownloadPlatform | null
): (AppDownloadEntry & { isPrimary: boolean })[] {
	if (entries.length === 0) return [];

	const matchIndex = preferredPlatform
		? entries.findIndex((entry) => entry.platform === preferredPlatform)
		: -1;

	if (matchIndex < 0) {
		return entries.map((entry) => ({ ...entry, isPrimary: false }));
	}

	const match = entries[matchIndex];
	const rest = entries.filter((_, index) => index !== matchIndex);
	return [{ ...match, isPrimary: true }, ...rest.map((entry) => ({ ...entry, isPrimary: false }))];
}
