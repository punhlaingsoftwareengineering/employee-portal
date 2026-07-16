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

/** File picker accept strings for drive uploads per platform. */
export const APP_DOWNLOAD_ACCEPT: Record<AppDownloadPlatform, string> = {
	windows: '.exe,.msi,.msix,application/x-msdownload,application/vnd.ms-msi',
	macos: '.dmg,.pkg,application/x-apple-diskimage',
	android: '.apk,application/vnd.android.package-archive',
	linux: '.AppImage,.deb,.rpm,.run,.tar.gz,.tgz,.zip',
	zip: '.zip,application/zip,application/x-zip-compressed'
};
