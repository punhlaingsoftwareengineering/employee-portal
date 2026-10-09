import { ORIGIN } from '$app/env/private';
import { SITEMAP_PUBLIC_PATHS } from '$lib/constants/seo';
import type { RequestHandler } from './$types';

function siteOrigin(url: URL): string {
	const configured = ORIGIN?.trim().replace(/\/$/, '');
	if (configured) return configured;
	return url.origin.replace(/\/$/, '');
}

export const GET: RequestHandler = async ({ url }) => {
	const origin = siteOrigin(url);
	const lastmod = new Date().toISOString().slice(0, 10);
	const urls = SITEMAP_PUBLIC_PATHS.map(
		(path) => `  <url>
    <loc>${origin}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${path === '/onboarding' ? '1.0' : '0.7'}</priority>
  </url>`
	).join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
