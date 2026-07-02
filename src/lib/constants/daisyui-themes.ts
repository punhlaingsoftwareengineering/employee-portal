/** All 35 built-in DaisyUI themes (daisyUI v5). */
export const DAISYUI_BUILTIN_THEMES = [
	'light',
	'dark',
	'cupcake',
	'bumblebee',
	'emerald',
	'corporate',
	'synthwave',
	'retro',
	'cyberpunk',
	'valentine',
	'halloween',
	'garden',
	'forest',
	'aqua',
	'lofi',
	'pastel',
	'fantasy',
	'wireframe',
	'black',
	'luxury',
	'dracula',
	'cmyk',
	'autumn',
	'business',
	'acid',
	'lemonade',
	'night',
	'coffee',
	'winter',
	'dim',
	'nord',
	'sunset',
	'caramellatte',
	'abyss',
	'silk'
] as const;

export type DaisyUIThemeName = (typeof DAISYUI_BUILTIN_THEMES)[number];

export const SYSTEM_THEME_OPTION = 'system' as const;

export type SystemThemeOption = typeof SYSTEM_THEME_OPTION;

export function formatDaisyUIThemeLabel(name: string): string {
	if (name === SYSTEM_THEME_OPTION) return 'System (auto)';
	return name.charAt(0).toUpperCase() + name.slice(1);
}

/** Light/dark pair used when the user picks System (follows OS preference). */
export const SYSTEM_LIGHT_THEME: DaisyUIThemeName = 'winter';
export const SYSTEM_DARK_THEME: DaisyUIThemeName = 'night';

export function resolveSystemTheme(prefersDark: boolean): DaisyUIThemeName {
	return prefersDark ? SYSTEM_DARK_THEME : SYSTEM_LIGHT_THEME;
}
