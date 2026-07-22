export const ONBOARDING_FACILITY_DISPLAY_LIMIT = 6;
export const ONBOARDING_NEWSLETTER_DISPLAY_LIMIT = 8;

export const ONBOARDING_SECTION_IDS = {
	services: 'services',
	apps: 'apps',
	pharmacyMaster: 'pharmacy-master',
	facilities: 'facilities',
	newsletters: 'newsletters'
} as const;

/** Onboarding facility tabs keyed by external facility id (not portal facility UUID). */
export const ONBOARDING_FACILITY_TABS = [
	{ id: '2', name: 'Hlaing Thar Yar' },
	{ id: '6', name: 'Mandalay' },
	{ id: '8', name: 'Taung Gyi' }
] as const;

export type OnboardingFacilityTabId = (typeof ONBOARDING_FACILITY_TABS)[number]['id'];
