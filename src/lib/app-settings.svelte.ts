import { browser } from '$app/env';
import {
	resolveSystemTheme,
	SYSTEM_THEME_OPTION
} from '$lib/constants/daisyui-themes';
import {
	APP_BRANDING_COOKIE,
	APP_FONTS,
	APP_SETTINGS_STORAGE_KEY,
	APP_THEMES,
	DEFAULT_APP_SETTINGS,
	DEFAULT_PORTAL_FONT_POLICY,
	DEFAULT_PORTAL_THEME_POLICY,
	filterAllowedFontOptions,
	filterAllowedThemeOptions,
	type AppBranding,
	type AppFont,
	type AppSettings,
	type PortalFontPolicy,
	type PortalThemePolicy
} from '$lib/constants/app-settings';

export const SHARED_THEME_STORAGE_KEY = 'phh-ui-theme';
export const SHARED_FONT_STORAGE_KEY = 'phh-ui-font';

const VALID_FONTS = new Set(APP_FONTS.map((f) => f.value));
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
		title:
			typeof parsed.title === 'string' && parsed.title.trim()
				? parsed.title.trim()
				: DEFAULT_APP_SETTINGS.title,
		iconUrl: normalizeIconUrl(parsed.iconUrl)
	};
}

function loadSettings(): AppSettings {
	if (!browser) return { ...DEFAULT_APP_SETTINGS };

	try {
		const raw = localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
		if (!raw) return { ...DEFAULT_APP_SETTINGS };
		const parsed = { ...DEFAULT_APP_SETTINGS, ...JSON.parse(raw) } as Record<string, unknown>;
		return normalizeSettings(parsed);
	} catch {
		return { ...DEFAULT_APP_SETTINGS };
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
	writeCookie(SHARED_THEME_STORAGE_KEY, settings.theme);
	writeCookie(SHARED_FONT_STORAGE_KEY, settings.font);
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

export function getAllowedThemeOptions() {
	return filterAllowedThemeOptions(portalThemePolicy.allowedThemes);
}

export function getAllowedFontOptions() {
	return filterAllowedFontOptions(portalFontPolicy.allowedFonts);
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

	const loaded = loadSettings();
	Object.assign(appSettings, loaded);
	const sharedTheme = readCookie(SHARED_THEME_STORAGE_KEY) ?? localStorage.getItem(SHARED_THEME_STORAGE_KEY);
	const sharedFont = readCookie(SHARED_FONT_STORAGE_KEY) ?? localStorage.getItem(SHARED_FONT_STORAGE_KEY);
	if (sharedTheme && VALID_THEMES.has(sharedTheme as AppTheme)) {
		appSettings.theme = sharedTheme as AppTheme;
	}
	if (sharedFont && VALID_FONTS.has(sharedFont as AppFont)) {
		appSettings.font = sharedFont as AppFont;
	}
	clampThemeToPolicy();
	clampFontToPolicy();
	persistSettings(appSettings);
	persistBrandingCookie(appSettings);
}

export function applyAppSettings(settings: AppSettings = appSettings) {
	if (!browser) return;

	const root = document.documentElement;
	root.setAttribute('data-theme', themeAttributeValue(settings.theme));
	root.dataset.appFont = settings.font;
}

export function updateAppSettings(partial: Partial<AppSettings>) {
	if (partial.theme && !portalThemePolicy.allowedThemes.includes(partial.theme)) {
		partial.theme = portalThemePolicy.defaultTheme;
	}
	if (partial.font && !portalFontPolicy.allowedFonts.includes(partial.font)) {
		partial.font = portalFontPolicy.defaultFont;
	}
	Object.assign(appSettings, partial);
	persistSettings(appSettings);
	applyAppSettings(appSettings);
}

export function resetAppSettings() {
	Object.assign(appSettings, {
		...DEFAULT_APP_SETTINGS,
		theme: portalThemePolicy.defaultTheme,
		font: portalFontPolicy.defaultFont,
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
