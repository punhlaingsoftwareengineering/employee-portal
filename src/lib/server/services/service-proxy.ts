import type { RequestEvent } from '@sveltejs/kit';
import { error } from '@sveltejs/kit';
import { getService } from '$lib/server/services/service';

const FORWARD_REQUEST_HEADERS = [
	'accept',
	'accept-language',
	'content-type',
	'cookie',
	'authorization',
	'cache-control'
];

const STRIP_RESPONSE_HEADERS = [
	'x-frame-options',
	'content-security-policy',
	'content-security-policy-report-only',
	'content-length',
	'transfer-encoding'
];

function getUpstreamOrigin(serviceLink: string): URL {
	return new URL(serviceLink);
}

function buildUpstreamUrl(serviceLink: string, path: string | undefined, search: string): URL {
	const base = getUpstreamOrigin(serviceLink);
	const pathname = path ? `/${path}` : '/';
	return new URL(`${pathname}${search}`, base);
}

function getProxyBase(serviceId: string): string {
	return `/portal/${serviceId}/go`;
}

function rewriteLocationHeader(location: string, serviceLink: string, proxyBase: string): string {
	const upstreamOrigin = getUpstreamOrigin(serviceLink);
	const resolved = new URL(location, upstreamOrigin);

	if (resolved.origin !== upstreamOrigin.origin) {
		return location;
	}

	const path = resolved.pathname.replace(/^\//, '');
	const suffix = path ? `/${path}` : '';
	return `${proxyBase}${suffix}${resolved.search}`;
}

function rewriteRootRelativePaths(content: string, proxyBase: string): string {
	return content.replace(/(["'`])\/(?!\/|\\u)/g, `$1${proxyBase}/`);
}

function buildProxyShimScript(proxyBase: string): string {
	return `<script>
(function () {
	var PROXY_BASE = ${JSON.stringify(proxyBase)};
	function rewrite(url) {
		if (typeof url !== 'string') return url;
		if (url.startsWith('/') && !url.startsWith('//')) return PROXY_BASE + url;
		return url;
	}
	var originalFetch = window.fetch;
	window.fetch = function (input, init) {
		if (typeof input === 'string') return originalFetch.call(this, rewrite(input), init);
		if (input instanceof Request) return originalFetch.call(this, new Request(rewrite(input.url), input), init);
		return originalFetch.call(this, input, init);
	};
	var originalOpen = XMLHttpRequest.prototype.open;
	XMLHttpRequest.prototype.open = function (method, url) {
		var args = Array.prototype.slice.call(arguments, 2);
		return originalOpen.apply(this, [method, rewrite(url)].concat(args));
	};
})();
</script>`;
}

function rewriteHtml(html: string, serviceLink: string, proxyBase: string): string {
	const upstreamOrigin = getUpstreamOrigin(serviceLink);
	const upstreamRoot = upstreamOrigin.origin;
	const shim = buildProxyShimScript(proxyBase);
	const baseTag = `<base href="${proxyBase}/">`;

	let result = html
		.replaceAll(upstreamRoot, proxyBase)
		.replaceAll(`//${upstreamOrigin.host}`, proxyBase);

	result = result.replace(/(\s(?:href|src|action)=["'])\/(?!\/)/gi, `$1${proxyBase}/`);
	result = rewriteRootRelativePaths(result, proxyBase);

	if (/<head[\s>]/i.test(result)) {
		result = result.replace(/<head([^>]*)>/i, `<head$1>${shim}${baseTag}`);
	} else {
		result = shim + baseTag + result;
	}

	return result;
}

function rewriteAssetText(text: string, serviceLink: string, proxyBase: string): string {
	const upstreamOrigin = getUpstreamOrigin(serviceLink);
	return rewriteRootRelativePaths(
		text
			.replaceAll(upstreamOrigin.origin, proxyBase)
			.replaceAll(`//${upstreamOrigin.host}`, proxyBase),
		proxyBase
	);
}

function rewriteSetCookieHeaders(headers: Headers, proxyBase: string) {
	const cookies =
		typeof headers.getSetCookie === 'function'
			? headers.getSetCookie()
			: headers.get('set-cookie')
				? [headers.get('set-cookie')!]
				: [];

	if (cookies.length === 0) return;

	headers.delete('set-cookie');

	for (const cookie of cookies) {
		let rewritten = cookie.replace(/;\s*Domain=[^;]*/gi, '');
		if (/;\s*Path=/i.test(rewritten)) {
			rewritten = rewritten.replace(/;\s*Path=[^;]*/gi, `; Path=${proxyBase}/`);
		} else {
			rewritten += `; Path=${proxyBase}/`;
		}
		headers.append('set-cookie', rewritten);
	}
}

function sanitizeResponseHeaders(headers: Headers, serviceLink: string, proxyBase: string) {
	for (const name of STRIP_RESPONSE_HEADERS) {
		headers.delete(name);
	}

	const location = headers.get('location');
	if (location) {
		headers.set('location', rewriteLocationHeader(location, serviceLink, proxyBase));
	}

	rewriteSetCookieHeaders(headers, proxyBase);
}

export async function proxyServiceRequest(event: RequestEvent, method: string) {
	const serviceId = event.params.id;
	if (!serviceId) error(400, 'Missing service id');

	const service = await getService(serviceId);
	const proxyBase = getProxyBase(serviceId);
	const upstreamUrl = buildUpstreamUrl(service.link, event.params.path, event.url.search);

	const headers = new Headers();
	for (const name of FORWARD_REQUEST_HEADERS) {
		const value = event.request.headers.get(name);
		if (value) headers.set(name, value);
	}

	const hasBody = method !== 'GET' && method !== 'HEAD';
	const body = hasBody ? await event.request.arrayBuffer() : undefined;

	let upstreamResponse: Response;
	try {
		upstreamResponse = await fetch(upstreamUrl, {
			method,
			headers,
			body,
			redirect: 'manual'
		});
	} catch (cause) {
		const message = cause instanceof Error ? cause.message : 'Upstream request failed';
		error(502, `Could not reach service: ${message}`);
	}

	const responseHeaders = new Headers(upstreamResponse.headers);
	sanitizeResponseHeaders(responseHeaders, service.link, proxyBase);

	const contentType = responseHeaders.get('content-type') ?? '';

	if (contentType.includes('text/html')) {
		const html = await upstreamResponse.text();
		return new Response(rewriteHtml(html, service.link, proxyBase), {
			status: upstreamResponse.status,
			headers: responseHeaders
		});
	}

	if (
		contentType.includes('javascript') ||
		contentType.includes('json') ||
		contentType.includes('css')
	) {
		const text = await upstreamResponse.text();
		return new Response(rewriteAssetText(text, service.link, proxyBase), {
			status: upstreamResponse.status,
			headers: responseHeaders
		});
	}

	return new Response(upstreamResponse.body, {
		status: upstreamResponse.status,
		headers: responseHeaders
	});
}

export function getServiceEmbedSrc(serviceId: string, serviceLink: string): string {
	const url = new URL(serviceLink);
	const pathAndQuery = `${url.pathname.replace(/^\//, '')}${url.search}`;
	return `${getProxyBase(serviceId)}/${pathAndQuery}`;
}
