<script lang="ts">
	import { page } from '$app/state';
	import {
		SEO_DEFAULT_OG_IMAGE_PATH,
		SEO_ORG_NAME,
		SEO_SITE_NAME,
		SEO_TWITTER_CARD
	} from '$lib/constants/seo';

	let {
		title,
		description,
		path,
		ogImagePath = SEO_DEFAULT_OG_IMAGE_PATH,
		jsonLdType = 'WebPage',
		noindex = false
	}: {
		title: string;
		description: string;
		/** Pathname starting with `/` (canonical path). Defaults to current URL path. */
		path?: string;
		ogImagePath?: string;
		jsonLdType?: 'WebPage' | 'AboutPage' | 'CollectionPage';
		noindex?: boolean;
	} = $props();

	const origin = $derived(page.url.origin.replace(/\/$/, ''));
	const canonicalPath = $derived(path ?? page.url.pathname);
	const canonicalUrl = $derived(`${origin}${canonicalPath.startsWith('/') ? '' : '/'}${canonicalPath}`);
	const ogImageUrl = $derived(
		ogImagePath.startsWith('http') ? ogImagePath : `${origin}${ogImagePath}`
	);

	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@graph': [
				{
					'@type': 'Organization',
					name: SEO_ORG_NAME,
					url: origin
				},
				{
					'@type': 'WebSite',
					name: SEO_SITE_NAME,
					url: origin,
					publisher: { '@type': 'Organization', name: SEO_ORG_NAME }
				},
				{
					'@type': jsonLdType,
					name: title,
					description,
					url: canonicalUrl,
					isPartOf: { '@type': 'WebSite', name: SEO_SITE_NAME, url: origin }
				}
			]
		})
	);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={canonicalUrl} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:type" content="website" />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:site_name" content={SEO_SITE_NAME} />

	<meta name="twitter:card" content={SEO_TWITTER_CARD} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImageUrl} />

	{@html `<script type="application/ld+json">${jsonLd.replace(/</g, '\\u003c')}</script>`}
</svelte:head>
