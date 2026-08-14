import { browser } from '$app/env';
import {
	resolveSystemTheme,
	SYSTEM_THEME_OPTION
} from '$lib/constants/daisyui-themes';
import {
	APP_BRANDING_COOKIE,
	APP_FONTS,
	APP_FONT_SIZE_SCALE,
	APP_FONT_SIZES,
	APP_SETTINGS_STORAGE_KEY,
	APP_THEMES,
	DEFAULT_APP_SETTINGS,
	DEFAULT_PORTAL_FONT_POLICY,
	DEFAULT_PORTAL_FONT_SIZE_POLICY,
	DEFAULT_PORTAL_THEME_POLICY,
	filterAllowedFontOptions,
	filterAllowedFontSizeOptions,
	filterAllowedThemeOptions,
	type AppBranding,
	type AppFont,
	type AppFontSize,
	type AppSettings,
	type AppTheme,
	type PortalFontPolicy,
	type PortalFontSizePolicy,
	type PortalThemePolicy
} from '$lib/constants/app-settings';

export const SHARED_THEME_STORAGE_KEY = 'phh-ui-theme';
export const SHARED_FONT_STORAGE_KEY = 'phh-ui-font';
export const SHARED_FONT_SIZE_STORAGE_KEY = 'phh-ui-font-size';

const VALID_FONTS = new Set(APP_FONTS.map((f) => f.value));
const VALID_FONT_SIZES = new Set(APP_FONT_SIZES.map((s) => s.value));
const VALID_THEMES = new Set(APP_THEMES.map((t) => t.value));

function normalizeFont(font: unknown): AppFont {
	if (typeof font === 'string' && VALID_FONTS.has(font as AppFont)) {
		return font as AppFont;
	}
	if (font === 'mono') return 'maple-mono';
	if (font === 'sans') return 'adwaita-sans';
	if (font === 'serif') return 'times-new-roman';
	return DEFAULT_APP_SETTINGS.font;
}

function normalizeFontSize(size: unknown): AppFontSize {
	if (typeof size === 'string' && VALID_FONT_SIZES.has(size as AppFontSize)) {
		return size as AppFontSize;
	}
	return DEFAULT_APP_SETTINGS.fontSize;
}

function normalizeIconUrl(iconUrl: unknown): string | null {
	if (typeof iconUrl !== 'string') return null;
	const trimmed = iconUrl.trim();
	return trimmed || null;
}

function normalizeSettings(parsed: Record<string, unknown>): AppSettings {
	return {
		theme:
			typeof parsed.theme === 'string' && VALID_THEMES.has(parsed.theme as AppSettings['theme'])
				? (parsed.theme as AppSettings['theme'])
				: DEFAULT_APP_SETTINGS.theme,
		font: normalizeFont(parsed.font),
		fontSize: normalizeFontSize(parsed.fontSize),
		title:
			typeof parsed.title === 'string' && parsed.title.trim()
				? parsed.title.trim()
				: DEFAULT_APP_SETTINGS.title,
		iconUrl: normalizeIconUrl(parsed.iconUrl)
	};
}

function loadSettings(): { settings: AppSettings; hadStoredSettings: boolean } {
	if (!browser) return { settings: { ...DEFAULT_APP_SETTINGS }, hadStoredSettings: false };

	try {
		const raw = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
		if (!raw) {
			return {
				settings: {
					...DEFAULT_APP_SETTINGS,
					theme: portalThemePolicy.defaultTheme,
					font: portalFontPolicy.defaultFont,
					fontSize: portalFontSizePolicy.defaultFontSize
				},
				hadStoredSettings: false
			};
		}
		const parsed = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) } as Record<string, unknown>;
		return { settings: normalizeSettings(parsed), hadStoredSettings: true };
	} catch {
		return {
			settings: {
				...DEFAULT_APP_SETTINGS,
				theme: portalThemePolicy.defaultTheme,
				font: portalFontPolicy.defaultFont,
				fontSize: portalFontSizePolicy.defaultFontSize
			},
			hadStoredSettings: false
		};
	}
}

function getCookieDomain(): string | null {
	if (!browser) return null;
	const { hostname } = window.location;
	if (
		hostname === 'localhost' ||
		hostname.endsWith('.localhost') ||
		/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname)
	) {
		return null;
	}

	const parts = hostname.split('.').filter(Boolean);
	if (parts.length < 2) return null;
	return `.${parts.slice(-2).join('.')}`;
}

function readCookie(name: string): string | null {
	if (!browser) return null;
	const prefix = `${name}=`;
	for (const part of document.cookie.split(';')) {
		const trimmed = part.trim();
		if (trimmed.startsWith(prefix)) {
			return decodeURIComponent(trimmed.slice(prefix.length));
		}
	}
	return null;
}

function writeCookie(name: string, value: string) {
	if (!browser) return;
	const domain = getCookieDomain();
	const domainPart = domain ? `; domain=${domain}` : '';
	document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax${domainPart}`;
}

function persistBrandingCookie(settings: AppSettings) {
	if (!browser) return;

	const value = encodeURIComponent(
		JSON.stringify({
			title: settings.title,
			iconUrl: settings.iconUrl
		} satisfies AppBranding)
	);
	document.cookie = `${APP_BRANDING_COOKIE}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

function persistSettings(settings: AppSettings) {
	if (!browser) return;
	localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
	localStorage.setItem(SHARED_THEME_STORAGE_KEY, settings.theme);
	localStorage.setItem(SHARED_FONT_STORAGE_KEY, settings.font);
	localStorage.setItem(SHARED_FONT_SIZE_STORAGE_KEY, settings.fontSize);
	writeCookie(SHARED_THEME_STORAGE_KEY, settings.theme);
	writeCookie(SHARED_FONT_STORAGE_KEY, settings.font);
	writeCookie(SHARED_FONT_SIZE_STORAGE_KEY, settings.fontSize);
	persistBrandingCookie(settings);
}

function themeAttributeValue(theme: AppSettings['theme']): string {
	if (theme === SYSTEM_THEME_OPTION) {
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
		return resolveSystemTheme(prefersDark);
	}
	return theme;
}

export const appSettings = $state<AppSettings>({ ...DEFAULT_APP_SETTINGS });
export const portalThemePolicy = $state<PortalThemePolicy>({ ...DEFAULT_PORTAL_THEME_POLICY });
export const portalFontPolicy = $state<PortalFontPolicy>({ ...DEFAULT_PORTAL_FONT_POLICY });
export const portalFontSizePolicy = $state<PortalFontSizePolicy>({
	...DEFAULT_PORTAL_FONT_SIZE_POLICY
});

export function getAllowedThemeOptions() {
	return filterAllowedThemeOptions(portalThemePolicy.allowedThemes);
}

export function getAllowedFontOptions() {
	return filterAllowedFontOptions(portalFontPolicy.allowedFonts);
}

export function getAllowedFontSizeOptions() {
	return filterAllowedFontSizeOptions(portalFontSizePolicy.allowedFontSizes);
}

export function initPortalThemePolicyFromServer(policy?: PortalThemePolicy) {
	if (!policy) return;
	portalThemePolicy.allowedThemes = [...policy.allowedThemes];
	portalThemePolicy.defaultTheme = policy.defaultTheme;
}

export function initPortalFontPolicyFromServer(policy?: PortalFontPolicy) {
	if (!policy) return;
	portalFontPolicy.allowedFonts = [...policy.allowedFonts];
	portalFontPolicy.defaultFont = policy.defaultFont;
}

export function initPortalFontSizePolicyFromServer(policy?: PortalFontSizePolicy) {
	if (!policy) return;
	portalFontSizePolicy.allowedFontSizes = [...policy.allowedFontSizes];
	portalFontSizePolicy.defaultFontSize = policy.defaultFontSize;
}

function clampThemeToPolicy() {
	if (!portalThemePolicy.allowedThemes.includes(appSettings.theme)) {
		appSettings.theme = portalThemePolicy.defaultTheme;
	}
}

function clampFontToPolicy() {
	if (!portalFontPolicy.allowedFonts.includes(appSettings.font)) {
		appSettings.font = portalFontPolicy.defaultFont;
	}
}

function clampFontSizeToPolicy() {
	if (!portalFontSizePolicy.allowedFontSizes.includes(appSettings.fontSize)) {
		appSettings.fontSize = portalFontSizePolicy.defaultFontSize;
	}
}

/** Seed title/icon from layout load data (cookie branding). Safe on server and during hydration. */
export function initAppSettingsFromServer(branding?: Partial<AppBranding>) {
	if (!branding) return;

	Object.assign(appSettings, {
		title:
			typeof branding.title === 'string' && branding.title.trim()
				? branding.title.trim()
				: appSettings.title,
		iconUrl:
			branding.iconUrl === null || typeof branding.iconUrl === 'string'
				? normalizeIconUrl(branding.iconUrl)
				: appSettings.iconUrl
	});
}

/** Reload full settings from localStorage on the client (SSR defaults are not authoritative). */
export function hydrateAppSettingsFromStorage() {
	if (!browser) return;

	const { settings: loaded, hadStoredSettings } = loadSettings();
	Object.assign(appSettings, loaded);
	const sharedTheme = readCookie(SHARED_THEME_STORAGE_KEY) ?? localStorage.getItem(SHARED_THEME_STORAGE_KEY);
	const sharedFont = readCookie(SHARED_FONT_STORAGE_KEY) ?? localStorage.getItem(SHARED_FONT_STORAGE_KEY);
	const sharedFontSize =
		readCookie(SHARED_FONT_SIZE_STORAGE_KEY) ?? localStorage.getItem(SHARED_FONT_SIZE_STORAGE_KEY);
	const hasSharedTheme = Boolean(sharedTheme && VALID_THEMES.has(sharedTheme as AppTheme));
	const hasSharedFont = Boolean(sharedFont && VALID_FONTS.has(sharedFont as AppFont));
	const hasSharedFontSize = Boolean(
		sharedFontSize && VALID_FONT_SIZES.has(sharedFontSize as AppFontSize)
	);

	if (hasSharedTheme) {
		appSettings.theme = sharedTheme as AppTheme;
	} else if (!hadStoredSettings) {
		appSettings.theme = portalThemePolicy.defaultTheme;
	}
	if (hasSharedFont) {
		appSettings.font = sharedFont as AppFont;
	} else if (!hadStoredSettings) {
		appSettings.font = portalFontPolicy.defaultFont;
	}
	if (hasSharedFontSize) {
		appSettings.fontSize = sharedFontSize as AppFontSize;
	} else if (!hadStoredSettings) {
		appSettings.fontSize = portalFontSizePolicy.defaultFontSize;
	}

	clampThemeToPolicy();
	clampFontToPolicy();
	clampFontSizeToPolicy();
	persistSettings(appSettings);
	persistBrandingCookie(appSettings);
}

export function applyAppSettings(settings: AppSettings = appSettings) {
	if (!browser) return;

	const root = document.documentElement;
	root.setAttribute('data-theme', themeAttributeValue(settings.theme));
	root.dataset.appFont = settings.font;
	root.dataset.appFontSize = settings.fontSize;
	root.style.setProperty('--app-font-scale', String(APP_FONT_SIZE_SCALE[settings.fontSize]));
}

export function updateAppSettings(partial: Partial<AppSettings>) {
	if (partial.theme && !portalThemePolicy.allowedThemes.includes(partial.theme)) {
		partial.theme = portalThemePolicy.defaultTheme;
	}
	if (partial.font && !portalFontPolicy.allowedFonts.includes(partial.font)) {
		partial.font = portalFontPolicy.defaultFont;
	}
	if (partial.fontSize && !portalFontSizePolicy.allowedFontSizes.includes(partial.fontSize)) {
		partial.fontSize = portalFontSizePolicy.defaultFontSize;
	}
	Object.assign(appSettings, partial);
	persistSettings(appSettings);
	applyAppSettings(appSettings);
}

export function resetThemeToDefault() {
	updateAppSettings({ theme: portalThemePolicy.defaultTheme });
}

export function resetFontToDefault() {
	updateAppSettings({ font: portalFontPolicy.defaultFont });
}

export function resetFontSizeToDefault() {
	updateAppSettings({ fontSize: portalFontSizePolicy.defaultFontSize });
}

export function resetAppSettings() {
	Object.assign(appSettings, {
		...DEFAULT_APP_SETTINGS,
		theme: portalThemePolicy.defaultTheme,
		font: portalFontPolicy.defaultFont,
		fontSize: portalFontSizePolicy.defaultFontSize,
		title: appSettings.title,
		iconUrl: appSettings.iconUrl
	});
	persistSettings(appSettings);
	applyAppSettings(appSettings);
}

export function watchSystemThemePreference(onChange: () => void) {
	if (!browser) return () => {};

	const media = window.matchMedia('(prefers-color-scheme: dark)');
	const handler = () => {
		if (appSettings.theme === SYSTEM_THEME_OPTION) onChange();
	};
	media.addEventListener('change', handler);
	return () => media.removeEventListener('change', handler);
}
