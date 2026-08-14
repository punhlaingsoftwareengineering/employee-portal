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
	{ value: 'adwaita-sans', label: 'Adwaita Sans' },
	{ value: 'adwaita-mono', label: 'Adwaita Mono' },
	{ value: 'roboto', label: 'Roboto' },
	{ value: 'arial', label: 'Arial' },
	{ value: 'times-new-roman', label: 'Times New Roman' },
	{ value: 'comic-relief', label: 'Comic Relief' },
	{ value: 'pangolin', label: 'Pangolin' }
] as const;

export const APP_FONT_VALUES = APP_FONTS.map((font) => font.value);

export type AppFont = (typeof APP_FONTS)[number]['value'];

/** Shared across portal, docs, and drive (`phh-ui-font-size`). */
export const APP_FONT_SIZES = [
	{ value: 'extra-small', label: 'Extra small', scale: 0.8125 },
	{ value: 'smaller', label: 'Smaller', scale: 0.875 },
	{ value: 'normal', label: 'Normal', scale: 1 },
	{ value: 'larger', label: 'Larger', scale: 1.125 },
	{ value: 'extra-large', label: 'Extra large', scale: 1.25 }
] as const;

export const APP_FONT_SIZE_VALUES = APP_FONT_SIZES.map((size) => size.value);

export type AppFontSize = (typeof APP_FONT_SIZES)[number]['value'];

export const APP_FONT_SIZE_SCALE: Record<AppFontSize, number> = Object.fromEntries(
	APP_FONT_SIZES.map((size) => [size.value, size.scale])
) as Record<AppFontSize, number>;

export type AppSettings = {
	theme: AppTheme;
	font: AppFont;
	fontSize: AppFontSize;
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

export type PortalFontPolicy = {
	allowedFonts: AppFont[];
	defaultFont: AppFont;
};

export const DEFAULT_PORTAL_FONT_POLICY: PortalFontPolicy = {
	allowedFonts: [...APP_FONT_VALUES],
	defaultFont: 'maple-mono'
};

export function filterAllowedFontOptions(allowedFonts: AppFont[]) {
	return APP_FONTS.filter((option) => allowedFonts.includes(option.value));
}

export type PortalFontSizePolicy = {
	allowedFontSizes: AppFontSize[];
	defaultFontSize: AppFontSize;
};

export const DEFAULT_PORTAL_FONT_SIZE_POLICY: PortalFontSizePolicy = {
	allowedFontSizes: [...APP_FONT_SIZE_VALUES],
	defaultFontSize: 'normal'
};

export function filterAllowedFontSizeOptions(allowedFontSizes: AppFontSize[]) {
	return APP_FONT_SIZES.filter((option) => allowedFontSizes.includes(option.value));
}

export const DEFAULT_APP_SETTINGS: AppSettings = {
	theme: SYSTEM_THEME_OPTION,
	font: 'maple-mono',
	fontSize: 'normal',
	title: DEFAULT_APP_TITLE,
	iconUrl: null
};
