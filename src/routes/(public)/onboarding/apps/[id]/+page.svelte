<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import AppDetailPanel from '$lib/components/AppDetailPanel.svelte';
	import { PUBLIC_ROUTES } from '$lib/constants/public-routes';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.app.name}</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8">
	<div class="mb-4">
		<a href={PUBLIC_ROUTES.onboarding} class="btn btn-ghost btn-sm gap-2">
			<ArrowLeft class="h-4 w-4" />
			Back to home
		</a>
	</div>

	<AppDetailPanel app={data.app} />
</div>
