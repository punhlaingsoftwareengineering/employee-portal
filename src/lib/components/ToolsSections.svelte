<script lang="ts">
	import { Search, Globe, Smartphone, Pin } from '@lucide/svelte';
	import AppCard from '$lib/components/AppCard.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';
	import ServiceCard from '$lib/components/ServiceCard.svelte';
	import { dashboardPins } from '$lib/dashboard-pins.svelte';
	import { getServiceLinkStatuses } from '$lib/remotes/service.remote';
	import { matchesColumnFilter } from '$lib/utils/table-filter';
	import { ONBOARDING_SECTION_IDS } from '$lib/constants/onboarding';
	import type { AppSummary } from '$lib/schemas/app';
	import type { ServiceSummary } from '$lib/schemas/service';

	let {
		services = [],
		apps = [],
		appHref,
		showEmpty = false,
		emptyMessage = 'No public tools available yet.',
		gridMaxCols = 7,
		sectionHeadStyle = 'default',
		enablePins = false
	}: {
		services?: ServiceSummary[];
		apps?: AppSummary[];
		appHref: (id: string) => string;
		showEmpty?: boolean;
		emptyMessage?: string;
		gridMaxCols?: 5 | 7;
		sectionHeadStyle?: 'default' | 'onboarding';
		enablePins?: boolean;
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
	const pinnedServices = $derived(
		enablePins
			? filteredServices.filter((item) => dashboardPins.isPinned('service', item.id))
			: []
	);
	const unpinnedServices = $derived(
		enablePins
			? filteredServices.filter((item) => !dashboardPins.isPinned('service', item.id))
			: filteredServices
	);
	const pinnedApps = $derived(
		enablePins ? filteredApps.filter((item) => dashboardPins.isPinned('app', item.id)) : []
	);
	const unpinnedApps = $derived(
		enablePins ? filteredApps.filter((item) => !dashboardPins.isPinned('app', item.id)) : filteredApps
	);
	const hasPinnedTools = $derived(pinnedServices.length > 0 || pinnedApps.length > 0);
	const hasFilteredTools = $derived(
		pinnedServices.length > 0 ||
			pinnedApps.length > 0 ||
			unpinnedServices.length > 0 ||
			unpinnedApps.length > 0
	);
	const pinnedServiceIds = $derived(pinnedServices.map((item) => item.id));
	const unpinnedServiceIds = $derived(unpinnedServices.map((item) => item.id));
	const searchPlaceholder = $derived(
		services.length > 0 && apps.length === 0
			? 'Search services…'
			: services.length === 0 && apps.length > 0
				? 'Search apps…'
				: 'Search services and apps…'
	);

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
			placeholder={searchPlaceholder}
			bind:value={searchQuery}
		/>
	</label>

	{#if !hasFilteredTools}
		<p class="text-base-content/70">No tools match your search.</p>
	{:else}
		{#if hasPinnedTools}
			<section class="mb-10 scroll-mt-24">
				<SectionHead
					icon={Pin}
					title="Pinned"
					description="Your favorite services and apps, always at the top of the dashboard."
				/>

				{#if pinnedServices.length > 0}
					<h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-base-content/80">
						<Globe class="h-4 w-4" />
						Services
					</h3>
					<svelte:boundary>
						{@const linkStatuses = await getServiceLinkStatuses(pinnedServiceIds)}
						<div class="{serviceGridClass} mb-6">
							{#each pinnedServices as item (item.id)}
								<ServiceCard
									name={item.name}
									description={item.description}
									link={item.link}
									iconUrl={item.iconUrl}
									category={item.category}
									accentColor={item.accentColor}
									linkStatus={linkStatusFor(item.id, linkStatuses, 'down')}
									showPin={enablePins}
									pinned={true}
									onPinToggle={() => dashboardPins.toggle('service', item.id)}
								/>
							{/each}
						</div>

						{#snippet pending()}
							<div class="{serviceGridClass} mb-6">
								{#each pinnedServices as item (item.id)}
									<ServiceCard
										name={item.name}
										description={item.description}
										link={item.link}
										iconUrl={item.iconUrl}
										category={item.category}
										accentColor={item.accentColor}
										linkStatus="checking"
										showPin={enablePins}
										pinned={true}
										onPinToggle={() => dashboardPins.toggle('service', item.id)}
									/>
								{/each}
							</div>
						{/snippet}

						{#snippet failed()}
							<div class="{serviceGridClass} mb-6">
								{#each pinnedServices as item (item.id)}
									<ServiceCard
										name={item.name}
										description={item.description}
										link={item.link}
										iconUrl={item.iconUrl}
										category={item.category}
										accentColor={item.accentColor}
										linkStatus="down"
										showPin={enablePins}
										pinned={true}
										onPinToggle={() => dashboardPins.toggle('service', item.id)}
									/>
								{/each}
							</div>
						{/snippet}
					</svelte:boundary>
				{/if}

				{#if pinnedApps.length > 0}
					<h3 class="mb-3 flex items-center gap-2 text-sm font-semibold text-base-content/80">
						<Smartphone class="h-4 w-4" />
						Apps
					</h3>
					<div class={appGridClass}>
						{#each pinnedApps as item (item.id)}
							<AppCard
								href={appHref(item.id)}
								name={item.name}
								tagline={item.tagline}
								description={item.description}
								iconUrl={item.iconUrl}
								category={item.category}
								developer={item.developer}
								version={item.version}
								showPin={enablePins}
								pinned={true}
								onPinToggle={() => dashboardPins.toggle('app', item.id)}
							/>
						{/each}
					</div>
				{/if}
			</section>
		{/if}

		{#if unpinnedServices.length > 0}
			<section
				class="mb-10 scroll-mt-24"
				id={sectionHeadStyle === 'onboarding' ? ONBOARDING_SECTION_IDS.services : undefined}
			>
				{#if sectionHeadStyle === 'onboarding'}
					<SectionHead
						icon={Globe}
						title="Services"
						description="Browse web-based tools and integrations available to everyone."
					/>
				{:else}
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
						<Globe class="h-5 w-5" />
						Services
					</h2>
				{/if}
				<svelte:boundary>
					{@const linkStatuses = await getServiceLinkStatuses(unpinnedServiceIds)}
					<div class={serviceGridClass}>
						{#each unpinnedServices as item (item.id)}
							<ServiceCard
								name={item.name}
								description={item.description}
								link={item.link}
								iconUrl={item.iconUrl}
								category={item.category}
								accentColor={item.accentColor}
								linkStatus={linkStatusFor(item.id, linkStatuses, 'down')}
								showPin={enablePins}
								pinned={false}
								onPinToggle={() => dashboardPins.toggle('service', item.id)}
							/>
						{/each}
					</div>

					{#snippet pending()}
						<div class={serviceGridClass}>
							{#each unpinnedServices as item (item.id)}
								<ServiceCard
									name={item.name}
									description={item.description}
									link={item.link}
									iconUrl={item.iconUrl}
									category={item.category}
									accentColor={item.accentColor}
									linkStatus="checking"
									showPin={enablePins}
									pinned={false}
									onPinToggle={() => dashboardPins.toggle('service', item.id)}
								/>
							{/each}
						</div>
					{/snippet}

					{#snippet failed()}
						<div class={serviceGridClass}>
							{#each unpinnedServices as item (item.id)}
								<ServiceCard
									name={item.name}
									description={item.description}
									link={item.link}
									iconUrl={item.iconUrl}
									category={item.category}
									accentColor={item.accentColor}
									linkStatus="down"
									showPin={enablePins}
									pinned={false}
									onPinToggle={() => dashboardPins.toggle('service', item.id)}
								/>
							{/each}
						</div>
					{/snippet}
				</svelte:boundary>
			</section>
		{/if}

		{#if unpinnedApps.length > 0}
			<section
				class="scroll-mt-24"
				id={sectionHeadStyle === 'onboarding' ? ONBOARDING_SECTION_IDS.apps : undefined}
			>
				{#if sectionHeadStyle === 'onboarding'}
					<SectionHead
						icon={Smartphone}
						title="Apps"
						description="Explore our mobile applications for staff and patients."
					/>
				{:else}
					<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
						<Smartphone class="h-5 w-5" />
						Apps
					</h2>
				{/if}
				<div class={appGridClass}>
					{#each unpinnedApps as item (item.id)}
						<AppCard
							href={appHref(item.id)}
							name={item.name}
							tagline={item.tagline}
							description={item.description}
							iconUrl={item.iconUrl}
							category={item.category}
							developer={item.developer}
							version={item.version}
							showPin={enablePins}
							pinned={false}
							onPinToggle={() => dashboardPins.toggle('app', item.id)}
						/>
					{/each}
				</div>
			</section>
		{/if}
	{/if}
{/if}
