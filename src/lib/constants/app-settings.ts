export const APP_SETTINGS_STORAGE_KEY = 'employee-portal-settings';
export const APP_BRANDING_COOKIE = 'portal-branding';

export const SIDEBAR_WIDTH_STORAGE_KEY = 'employee-portal-sidebar-width';
export const DEFAULT_SIDEBAR_WIDTH = 256;
export const MIN_SIDEBAR_WIDTH = 200;
export const MAX_SIDEBAR_WIDTH = 400;

export const DEFAULT_APP_TITLE = 'Employee Portal';

export const APP_THEMES = [
	{ value: 'system', label: 'System' },
	{ value: 'winter', label: 'Light (winter)' },
	{ value: 'night', label: 'Dark (night)' }
] as const;

export const APP_FONTS = [
	{ value: 'maple-mono', label: 'Maple Mono' },
	{ value: 'adwaita-sans', label: 'Adwaita Sans' }
] as const;

export type AppTheme = (typeof APP_THEMES)[number]['value'];
export type AppFont = (typeof APP_FONTS)[number]['value'];

export type AppSettings = {
	theme: AppTheme;
	font: AppFont;
	title: string;
	iconUrl: string | null;
};

export const DEFAULT_APP_SETTINGS: AppSettings = {
	theme: 'system',
	font: 'maple-mono',
	title: DEFAULT_APP_TITLE,
	iconUrl: null
};
