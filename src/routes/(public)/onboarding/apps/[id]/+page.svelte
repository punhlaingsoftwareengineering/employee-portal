<script lang="ts">
	import { ArrowLeft } from '@lucide/svelte';
	import AppDetailPanel from '$lib/components/AppDetailPanel.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { PUBLIC_ROUTES } from '$lib/constants/public-routes';

	let { data } = $props();
</script>

<PageTitle title={data.app.name} />

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-4 flex flex-wrap gap-2">
		<a href={PUBLIC_ROUTES.apps} class="btn btn-ghost btn-sm gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to apps
		</a>
		<a href={PUBLIC_ROUTES.onboarding} class="btn btn-ghost btn-sm">Home</a>
	</div>

	<AppDetailPanel app={data.app} />
</div>
