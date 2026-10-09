import { ORIGIN } from '$app/env/private';
import type { RequestHandler } from './$types';

function siteOrigin(url: URL): string {
	const configured = ORIGIN?.trim().replace(/\/$/, '');
	if (configured) return configured;
	return url.origin.replace(/\/$/, '');
}

export const GET: RequestHandler = async ({ url }) => {
	const origin = siteOrigin(url);
	const body = `User-agent: *
Allow: /

Disallow: /auth/
Disallow: /dashboard
Disallow: /settings
Disallow: /users
Disallow: /roles
Disallow: /employees
Disallow: /doctors
Disallow: /facilities
Disallow: /departments
Disallow: /tools/manage
Disallow: /community/manage
Disallow: /api/

Sitemap: ${origin}/sitemap.xml
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
