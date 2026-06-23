export const APP_DOWNLOAD_PLATFORMS = ['windows', 'macos', 'android', 'linux', 'zip'] as const;
export type AppDownloadPlatform = (typeof APP_DOWNLOAD_PLATFORMS)[number];

export type AppDownloadUrls = Partial<Record<AppDownloadPlatform, string>>;

export const APP_DOWNLOAD_PLATFORM_LABELS: Record<AppDownloadPlatform, string> = {
	windows: 'Windows',
	macos: 'macOS',
	android: 'Android',
	linux: 'Linux',
	zip: 'ZIP'
};
