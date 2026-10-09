export const PUBLIC_ROUTES = {
	onboarding: '/onboarding',
	community: '/community',
	tipsAndTutorials: '/tips-and-tutorials',
	services: '/services',
	apps: '/apps',
	newsletters: '/newsletters',
	directoryEmployees: '/directory/employees',
	directoryDoctors: '/directory/doctors',
	eSignature: '/tools/e-signature'
} as const;

export function publicAppHref(id: string): string {
	return `${PUBLIC_ROUTES.onboarding}/apps/${id}`;
}
