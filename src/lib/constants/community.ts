export const COMMUNITY_PLATFORMS = [
	'facebook',
	'instagram',
	'linkedin',
	'youtube',
	'github',
	'discord',
	'telegram',
	'whatsapp',
	'x',
	'website',
	'other'
] as const;

export type CommunityPlatform = (typeof COMMUNITY_PLATFORMS)[number];

export const COMMUNITY_PLATFORM_LABELS: Record<CommunityPlatform, string> = {
	facebook: 'Facebook',
	instagram: 'Instagram',
	linkedin: 'LinkedIn',
	youtube: 'YouTube',
	github: 'GitHub',
	discord: 'Discord',
	telegram: 'Telegram',
	whatsapp: 'WhatsApp',
	x: 'X (Twitter)',
	website: 'Website',
	other: 'Other'
};

export const COMMUNITY_PLATFORM_OPTIONS = COMMUNITY_PLATFORMS.map((value) => ({
	value,
	label: COMMUNITY_PLATFORM_LABELS[value]
}));

export const DEFAULT_COMMUNITY_PLATFORM: CommunityPlatform = 'website';
