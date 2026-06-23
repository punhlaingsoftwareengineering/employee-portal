<script lang="ts">
	import { page } from '$app/state';
	import ToolsSections from '$lib/components/ToolsSections.svelte';

	const services = $derived(page.data.availableServices ?? []);
	const apps = $derived(page.data.availableApps ?? []);
	const hasTools = $derived(services.length > 0 || apps.length > 0);
</script>

{#if !hasTools}
	<ToolsSections
		{services}
		{apps}
		appHref={(id) => `/apps/${id}`}
		showEmpty
		emptyMessage="Your access roles do not include any tools yet. Contact an administrator if you need access."
	/>
{:else}
	<ToolsSections {services} {apps} appHref={(id) => `/apps/${id}`} />
{/if}
