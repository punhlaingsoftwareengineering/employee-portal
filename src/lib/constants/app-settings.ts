import {
	DAISYUI_BUILTIN_THEMES,
	SYSTEM_THEME_OPTION,
	formatDaisyUIThemeLabel
} from '$lib/constants/daisyui-themes';

export const APP_SETTINGS_STORAGE_KEY = 'employee-portal-settings';
export const APP_BRANDING_COOKIE = 'portal-branding';

export const SIDEBAR_WIDTH_STORAGE_KEY = 'employee-portal-sidebar-width';
export const DEFAULT_SIDEBAR_WIDTH = 256;
export const MIN_SIDEBAR_WIDTH = 200;
export const MAX_SIDEBAR_WIDTH = 400;

export const DEFAULT_APP_TITLE = 'Employee Portal';

export const APP_THEME_VALUES = [SYSTEM_THEME_OPTION, ...DAISYUI_BUILTIN_THEMES] as const;

export type AppTheme = (typeof APP_THEME_VALUES)[number];

export const APP_THEMES = APP_THEME_VALUES.map((value) => ({
	value,
	label: formatDaisyUIThemeLabel(value)
}));

export const APP_FONTS = [
	{ value: 'maple-mono', label: 'Maple Mono' },
	{ value: 'adwaita-sans', label: 'Adwaita Sans' }
] as const;

export type AppFont = (typeof APP_FONTS)[number]['value'];

export type AppSettings = {
	theme: AppTheme;
	font: AppFont;
	title: string;
	iconUrl: string | null;
};

export type AppBranding = Pick<AppSettings, 'title' | 'iconUrl'>;

export type PortalThemePolicy = {
	allowedThemes: AppTheme[];
	defaultTheme: AppTheme;
};

export const DEFAULT_PORTAL_THEME_POLICY: PortalThemePolicy = {
	allowedThemes: [...APP_THEME_VALUES],
	defaultTheme: SYSTEM_THEME_OPTION
};

export function filterAllowedThemeOptions(allowedThemes: AppTheme[]) {
	return APP_THEMES.filter((option) => allowedThemes.includes(option.value));
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
	theme: SYSTEM_THEME_OPTION,
	font: 'maple-mono',
	title: DEFAULT_APP_TITLE,
	iconUrl: null
};
