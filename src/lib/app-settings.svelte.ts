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
	DEFAULT_PORTAL_THEME_POLICY,
	filterAllowedThemeOptions,
	type AppBranding,
	type AppFont,
	type AppSettings,
	type PortalThemePolicy
} from '$lib/constants/app-settings';

const VALID_FONTS = new Set(APP_FONTS.map((f) => f.value));
const VALID_THEMES = new Set(APP_THEMES.map((t) => t.value));

function normalizeFont(font: unknown): AppFont {
	if (typeof font === 'string' && VALID_FONTS.has(font as AppFont)) {
		return font as AppFont;
	}
	if (font === 'mono') return 'maple-mono';
	if (font === 'sans' || font === 'serif') return 'adwaita-sans';
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

export function getAllowedThemeOptions() {
	return filterAllowedThemeOptions(portalThemePolicy.allowedThemes);
}

export function initPortalThemePolicyFromServer(policy?: PortalThemePolicy) {
	if (!policy) return;
	portalThemePolicy.allowedThemes = [...policy.allowedThemes];
	portalThemePolicy.defaultTheme = policy.defaultTheme;
}

function clampThemeToPolicy() {
	if (!portalThemePolicy.allowedThemes.includes(appSettings.theme)) {
		appSettings.theme = portalThemePolicy.defaultTheme;
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
	clampThemeToPolicy();
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
	Object.assign(appSettings, partial);
	persistSettings(appSettings);
	applyAppSettings(appSettings);
}

export function resetAppSettings() {
	Object.assign(appSettings, {
		...DEFAULT_APP_SETTINGS,
		theme: portalThemePolicy.defaultTheme,
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
