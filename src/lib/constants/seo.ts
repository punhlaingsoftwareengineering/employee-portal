import { DEFAULT_APP_TITLE } from '$lib/constants/app-settings';
import { PUBLIC_ROUTES } from '$lib/constants/public-routes';

export const SEO_SITE_NAME = DEFAULT_APP_TITLE;
export const SEO_ORG_NAME = 'Pun Hlaing Hospitals';
export const SEO_DEFAULT_OG_IMAGE_PATH = '/og-default.png';
export const SEO_TWITTER_CARD = 'summary_large_image' as const;

export type PageSeoCopy = {
	title: string;
	description: string;
};

/** Unique title (~50-60) + description (~150-160) per public indexable URL. */
export const pageSeo = {
	onboarding: {
		title: 'Employee Portal Onboarding',
		description:
			'Welcome to the Pun Hlaing Hospitals employee portal. Explore apps, services, pharmacy master, newsletters, and facilities in one place.'
	},
	newsletters: {
		title: 'Newsletters | Employee Portal',
		description:
			'Browse the latest Pun Hlaing Hospitals newsletters. Open PDF or image editions from the employee portal archive.'
	},
	community: {
		title: 'Community Links | Employee Portal',
		description:
			'Find published community and collaboration links for Pun Hlaing Hospitals staff in the employee portal.'
	},
	tipsAndTutorials: {
		title: 'Tips and Tutorials | Employee Portal',
		description:
			'Guides and video tutorials to help Pun Hlaing Hospitals staff use portal tools and workplace systems.'
	},
	services: {
		title: 'Public Services | Employee Portal',
		description:
			'Open public internal services available to Pun Hlaing Hospitals staff from the employee portal.'
	},
	apps: {
		title: 'Public Apps | Employee Portal',
		description:
			'Launch public staff and patient apps curated for Pun Hlaing Hospitals from the employee portal.'
	},
	directoryEmployees: {
		title: 'Employee Directory | Employee Portal',
		description:
			'Search the public directory of active Pun Hlaing Hospitals employees, including facility and loyalty tenure.'
	},
	directoryDoctors: {
		title: 'Doctor Directory | Employee Portal',
		description:
			'Browse the public directory of active Pun Hlaing Hospitals doctors with DRN and specialty details.'
	},
	eSignature: {
		title: 'E-Signature | Employee Portal',
		description:
			'Access the Pun Hlaing Hospitals e-signature tool from the employee portal for document signing workflows.'
	}
} as const satisfies Record<string, PageSeoCopy>;

export const SITEMAP_PUBLIC_PATHS: string[] = [
	PUBLIC_ROUTES.onboarding,
	PUBLIC_ROUTES.newsletters,
	PUBLIC_ROUTES.community,
	PUBLIC_ROUTES.tipsAndTutorials,
	PUBLIC_ROUTES.services,
	PUBLIC_ROUTES.apps,
	PUBLIC_ROUTES.directoryEmployees,
	PUBLIC_ROUTES.directoryDoctors,
	PUBLIC_ROUTES.eSignature
];
