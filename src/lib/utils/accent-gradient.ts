import { normalizeAccentColor } from '$lib/schemas/service';

export const DEFAULT_SERVICE_ACCENT = '#5B6CFF';

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb | null {
	const normalized = normalizeAccentColor(hex);
	if (!normalized) return null;

	const value = normalized.slice(1);
	return {
		r: Number.parseInt(value.slice(0, 2), 16),
		g: Number.parseInt(value.slice(2, 4), 16),
		b: Number.parseInt(value.slice(4, 6), 16)
	};
}

function mixRgb(color: Rgb, target: Rgb, amount: number): Rgb {
	return {
		r: Math.round(color.r + (target.r - color.r) * amount),
		g: Math.round(color.g + (target.g - color.g) * amount),
		b: Math.round(color.b + (target.b - color.b) * amount)
	};
}

function rgbToCss({ r, g, b }: Rgb): string {
	return `rgb(${r} ${g} ${b})`;
}

export function accentGradientBackground(hex: string | null | undefined): string {
	const base = hexToRgb(hex ?? DEFAULT_SERVICE_ACCENT) ?? hexToRgb(DEFAULT_SERVICE_ACCENT)!;
	const light = mixRgb(base, { r: 255, g: 255, b: 255 }, 0.22);
	const dark = mixRgb(base, { r: 0, g: 0, b: 0 }, 0.18);

	return `linear-gradient(135deg, ${rgbToCss(light)} 0%, ${rgbToCss(base)} 45%, ${rgbToCss(dark)} 100%)`;
}
