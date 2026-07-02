<script lang="ts">
	import ToolsSections from '$lib/components/ToolsSections.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { publicAppHref } from '$lib/constants/public-routes';

	let { data } = $props();
</script>

<PageTitle title="Apps" />

<div class="container mx-auto max-w-5xl px-4 py-8">
	<ToolsSections
		services={[]}
		apps={data.publicApps}
		appHref={publicAppHref}
		showEmpty
		emptyMessage="No public apps available yet."
		gridMaxCols={5}
		sectionHeadStyle="onboarding"
	/>
</div>
