/** Expected image aspect ratios for portal uploads (width:height). */

export type ImageAspectRatio = {
	/** Display label, e.g. `21:9` */
	label: string;
	width: number;
	height: number;
	/** Where this ratio is used in the UI */
	usage: string;
	/**
	 * Allowed relative deviation from the target ratio (0.05 = ±5%).
	 * Slightly looser for screenshots that are cropped differently per device.
	 */
	tolerance?: number;
};

export const IMAGE_ASPECT = {
	/** Portal branding, app/service icons, notification thumbnails */
	square: {
		label: '1:1',
		width: 1,
		height: 1,
		usage: 'Square icons and thumbnails'
	},
	/** Onboarding carousel slides */
	carousel: {
		label: '21:9',
		width: 21,
		height: 9,
		usage: 'Onboarding carousel slides'
	},
	/**
	 * Onboarding announcement image strip (display ~72px tall, full width).
	 * Target design size ≈ 1440×72.
	 */
	announcement: {
		label: '20:1',
		width: 20,
		height: 1,
		usage: 'Announcement banner (≈72px tall, full width)',
		tolerance: 0.1
	},
	/** App detail header banners */
	banner: {
		label: '21:9',
		width: 21,
		height: 9,
		usage: 'App detail banner images'
	},
	/** Facility cards on onboarding */
	facility: {
		label: '4:3',
		width: 4,
		height: 3,
		usage: 'Facility cards'
	},
	/** Newsletter cover images on onboarding */
	newsletter: {
		label: '4:5',
		width: 4,
		height: 5,
		usage: 'Newsletter covers'
	},
	/**
	 * Welcome / notice dialog poster (same 4:5 as newsletter covers).
	 * Prefer 4:5 over 1:1 so title + body still fit without a tall empty frame.
	 * Design size ≈ 480×600.
	 */
	notice: {
		label: '4:5',
		width: 4,
		height: 5,
		usage: 'Welcome / notice dialog posters',
		tolerance: 0.05
	},
	/**
	 * Daily onboarding popup images — target design size 1920×1080 (16:9).
	 */
	dailyPopup: {
		label: '16:9',
		width: 16,
		height: 9,
		usage: 'Daily onboarding popup (1920×1080)',
		tolerance: 0.02
	},
	/** App detail screenshot carousel (680×550 display) */
	screenshot: {
		label: '680:550',
		width: 680,
		height: 550,
		usage: 'App screenshots',
		tolerance: 0.08
	}
} as const satisfies Record<string, ImageAspectRatio>;

export type ImageAspectKey = keyof typeof IMAGE_ASPECT;

export function aspectHint(aspect: ImageAspectRatio): string {
	return `Required aspect ratio ${aspect.label} (${aspect.usage}). Images that do not match will be rejected.`;
}

export function formatAspectRatio(width: number, height: number): string {
	if (!width || !height) return 'unknown';
	const g = gcd(Math.round(width), Math.round(height));
	return `${Math.round(width / g)}:${Math.round(height / g)}`;
}

function gcd(a: number, b: number): number {
	let x = Math.abs(a);
	let y = Math.abs(b);
	while (y) {
		const t = y;
		y = x % y;
		x = t;
	}
	return x || 1;
}
