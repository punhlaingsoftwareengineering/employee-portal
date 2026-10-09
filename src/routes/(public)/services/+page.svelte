<script lang="ts">
	import ToolsSections from '$lib/components/ToolsSections.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { PUBLIC_ROUTES, publicAppHref } from '$lib/constants/public-routes';
	import { pageSeo } from '$lib/constants/seo';

	let { data } = $props();
	const seo = pageSeo.services;
</script>

<SeoHead title={seo.title} description={seo.description} path={PUBLIC_ROUTES.services} />

<div class="container mx-auto max-w-5xl px-4 py-4">
	<ToolsSections
		services={data.publicServices}
		apps={[]}
		appHref={publicAppHref}
		showEmpty
		emptyMessage="No public services available yet."
		gridMaxCols={5}
		sectionHeadStyle="onboarding"
	/>
</div>
