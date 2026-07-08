import type { AppFont } from '$lib/constants/app-settings';

export const PORTAL_FONT_STACKS: Record<AppFont, string> = {
	'maple-mono': "'Maple Mono', ui-monospace, monospace",
	'adwaita-sans': "'Adwaita Sans', ui-sans-serif, system-ui, sans-serif",
	'adwaita-mono': "'Adwaita Mono', ui-monospace, monospace",
	roboto: "'Roboto', ui-sans-serif, system-ui, sans-serif",
	arial: 'Arial, Helvetica, sans-serif',
	'times-new-roman': "'Times New Roman', Times, serif"
};

export function getPortalFontStack(font: AppFont): string {
	return PORTAL_FONT_STACKS[font];
}
