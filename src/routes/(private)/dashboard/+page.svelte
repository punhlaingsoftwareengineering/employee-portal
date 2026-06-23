<script lang="ts">
	import { page } from '$app/state';
	import { LayoutDashboard } from 'lucide-svelte';
	import ToolsGrid from '$lib/components/ToolsGrid.svelte';

	const userName = $derived(page.data.user?.name ?? 'there');
	const greeting = $derived.by(() => {
		const hour = new Date().getHours();
		if (hour < 12) return 'Good morning';
		if (hour < 17) return 'Good afternoon';
		return 'Good evening';
	});

	const serviceCount = $derived(page.data.availableServices?.length ?? 0);
	const appCount = $derived(page.data.availableApps?.length ?? 0);
	const toolCount = $derived(serviceCount + appCount);
</script>

<div class="mb-6">
	<h1 class="flex items-center gap-2 text-2xl font-bold">
		<LayoutDashboard class="h-6 w-6" />
		Dashboard
	</h1>
</div>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<h2 class="card-title text-2xl">{greeting}, {userName}</h2>
		<p class="text-base-content/70">
			{#if toolCount === 0}
				No services or apps are assigned to your roles yet. Contact an administrator if you need
				access.
			{:else}
				You have {toolCount}
				{toolCount === 1 ? 'tool' : 'tools'} available
				{#if serviceCount > 0 && appCount > 0}
					— {serviceCount} {serviceCount === 1 ? 'service' : 'services'} and {appCount}
					{appCount === 1 ? 'app' : 'apps'}.
				{:else if serviceCount > 0}
					— {serviceCount} {serviceCount === 1 ? 'service' : 'services'}.
				{:else}
					— {appCount} {appCount === 1 ? 'app' : 'apps'}.
				{/if}
			{/if}
		</p>
	</div>
</div>

{#if toolCount > 0}
	<section class="mt-8">
		<h2 class="mb-4 text-lg font-semibold">Your tools</h2>
		<ToolsGrid />
	</section>
{/if}