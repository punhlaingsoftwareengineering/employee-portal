export const ANNOUNCEMENT_TYPES = ['image', 'text'] as const;
export type AnnouncementType = (typeof ANNOUNCEMENT_TYPES)[number];

/** Display height for image-type announcements (full width, object-cover). */
export const ANNOUNCEMENT_IMAGE_HEIGHT_PX = 72;

export const ANNOUNCEMENT_ACCENT_PRESETS = [
	'primary',
	'secondary',
	'accent',
	'info',
	'success',
	'warning',
	'error',
	'neutral'
] as const;
export type AnnouncementAccentPreset = (typeof ANNOUNCEMENT_ACCENT_PRESETS)[number];

export const ANNOUNCEMENT_ACCENT_OPTIONS: { value: AnnouncementAccentPreset; label: string }[] = [
	{ value: 'primary', label: 'Primary' },
	{ value: 'secondary', label: 'Secondary' },
	{ value: 'accent', label: 'Accent' },
	{ value: 'info', label: 'Info' },
	{ value: 'success', label: 'Success' },
	{ value: 'warning', label: 'Warning' },
	{ value: 'error', label: 'Error' },
	{ value: 'neutral', label: 'Neutral' }
];
