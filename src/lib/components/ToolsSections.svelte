<script lang="ts">
	import { Search, Globe, Smartphone } from 'lucide-svelte';
	import AppCard from '$lib/components/AppCard.svelte';
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import { getServiceLinkStatuses } from '$lib/remotes/service.remote';
	import { matchesColumnFilter } from '$lib/utils/table-filter';
	import type { AppSummary } from '$lib/schemas/app';
	import type { ServiceSummary } from '$lib/schemas/service';

	let {
		services = [],
		apps = [],
		appHref,
		showEmpty = false,
		emptyMessage = 'No public tools available yet.',
		gridMaxCols = 7
	}: {
		services?: ServiceSummary[];
		apps?: AppSummary[];
		appHref: (id: string) => string;
		showEmpty?: boolean;
		emptyMessage?: string;
		gridMaxCols?: 5 | 7;
	} = $props();

	const serviceGridClass = $derived(
		gridMaxCols === 5 ? 'service-card-grid service-card-grid-max-5' : 'service-card-grid'
	);
	const appGridClass = $derived(
		gridMaxCols === 5 ? 'app-card-grid app-card-grid-max-5' : 'app-card-grid'
	);

	let searchQuery = $state('');

	const hasTools = $derived(services.length > 0 || apps.length > 0);

	function serviceSearchText(item: ServiceSummary): string {
		return [item.name, item.description, item.category, item.link].filter(Boolean).join(' ');
	}

	function appSearchText(item: AppSummary): string {
		return [item.name, item.tagline, item.description, item.category, item.developer, item.version]
			.filter(Boolean)
			.join(' ');
	}

	const filteredServices = $derived(
		services.filter((item) => matchesColumnFilter(serviceSearchText(item), searchQuery))
	);
	const filteredApps = $derived(
		apps.filter((item) => matchesColumnFilter(appSearchText(item), searchQuery))
	);
	const hasFilteredTools = $derived(filteredServices.length > 0 || filteredApps.length > 0);
	const filteredServiceIds = $derived(filteredServices.map((item) => item.id));

	function linkStatusFor(
		serviceId: string,
		statuses: Record<string, 'up' | 'down'> | null,
		fallback: 'checking' | 'down'
	): 'checking' | 'up' | 'down' {
		if (!statuses) return fallback;
		return statuses[serviceId] ?? 'down';
	}
</script>

{#if !hasTools}
	{#if showEmpty}
		<div class="card bg-base-100 shadow-sm">
			<div class="card-body items-center text-center">
				<Globe class="h-10 w-10 text-base-content/40" />
				<p class="text-base-content/70">{emptyMessage}</p>
			</div>
		</div>
	{/if}
{:else}
	<label class="input input-bordered mb-6 w-full">
		<Search class="h-4 w-4 shrink-0 opacity-50" />
		<input
			type="search"
			class="grow focus:outline-none focus:ring-0 focus:ring-offset-0"
			placeholder="Search services and apps…"
			bind:value={searchQuery}
		/>
	</label>

	{#if !hasFilteredTools}
		<p class="text-base-content/70">No tools match your search.</p>
	{:else}
		{#if filteredServices.length > 0}
			<section class="mb-10">
				<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
					<Globe class="h-5 w-5" />
					Services
				</h2>
				<svelte:boundary>
					{@const linkStatuses = await getServiceLinkStatuses(filteredServiceIds)}
					<div class={serviceGridClass}>
						{#each filteredServices as item (item.id)}
							<ServiceCard
								name={item.name}
								description={item.description}
								link={item.link}
								iconUrl={item.iconUrl}
								category={item.category}
								accentColor={item.accentColor}
								linkStatus={linkStatusFor(item.id, linkStatuses, 'down')}
							/>
						{/each}
					</div>

					{#snippet pending()}
						<div class={serviceGridClass}>
							{#each filteredServices as item (item.id)}
								<ServiceCard
									name={item.name}
									description={item.description}
									link={item.link}
									iconUrl={item.iconUrl}
									category={item.category}
									accentColor={item.accentColor}
									linkStatus="checking"
								/>
							{/each}
						</div>
					{/snippet}

					{#snippet failed()}
						<div class={serviceGridClass}>
							{#each filteredServices as item (item.id)}
								<ServiceCard
									name={item.name}
									description={item.description}
									link={item.link}
									iconUrl={item.iconUrl}
									category={item.category}
									accentColor={item.accentColor}
									linkStatus="down"
								/>
							{/each}
						</div>
					{/snippet}
				</svelte:boundary>
			</section>
		{/if}

		{#if filteredApps.length > 0}
			<section>
				<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
					<Smartphone class="h-5 w-5" />
					Apps
				</h2>
				<div class={appGridClass}>
					{#each filteredApps as item (item.id)}
						<AppCard
							href={appHref(item.id)}
							name={item.name}
							tagline={item.tagline}
							description={item.description}
							iconUrl={item.iconUrl}
							category={item.category}
							developer={item.developer}
							version={item.version}
						/>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
{/if}
