export const PUBLIC_ROUTES = {
	onboarding: '/onboarding',
	community: '/community',
	tipsAndTutorials: '/tips-and-tutorials',
	services: '/services',
	apps: '/apps'
} as const;

export function publicAppHref(id: string): string {
	return `${PUBLIC_ROUTES.onboarding}/apps/${id}`;
}
