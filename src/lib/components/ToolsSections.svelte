<script lang="ts">
	import { Eye, ExternalLink, Globe, Smartphone } from 'lucide-svelte';
	import ServiceIcon from '$lib/components/ServiceIcon.svelte';
	import type { AppSummary } from '$lib/schemas/app';
	import type { ServiceSummary } from '$lib/schemas/service';

	let {
		services = [],
		apps = [],
		appHref,
		showEmpty = false,
		emptyMessage = 'No public tools available yet.'
	}: {
		services?: ServiceSummary[];
		apps?: AppSummary[];
		appHref: (id: string) => string;
		showEmpty?: boolean;
		emptyMessage?: string;
	} = $props();

	const hasTools = $derived(services.length > 0 || apps.length > 0);
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
	{#if services.length > 0}
		<section class="mb-10">
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
				<Globe class="h-5 w-5" />
				Services
			</h2>
			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{#each services as item (item.id)}
					<a
						href={item.link}
						target="_blank"
						rel="noopener noreferrer"
						class="card bg-base-100 shadow-sm transition hover:shadow-md"
					>
						<div class="card-body">
							<h3 class="card-title flex items-center gap-2 text-lg">
								<ServiceIcon iconUrl={item.iconUrl} name={item.name} class="h-6 w-6" />
								{item.name}
							</h3>
							{#if item.description}
								<p class="text-sm text-base-content/70">{item.description}</p>
							{/if}
							<div class="card-actions justify-end">
								<span class="tooltip tooltip-primary tooltip-left" data-tip="Open">
									<span
										class="btn btn-primary btn-square btn-sm pointer-events-none"
										aria-hidden="true"
									>
										<ExternalLink class="h-4 w-4" />
									</span>
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}

	{#if apps.length > 0}
		<section>
			<h2 class="mb-4 flex items-center gap-2 text-lg font-semibold">
				<Smartphone class="h-5 w-5" />
				Apps
			</h2>
			<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{#each apps as item (item.id)}
					<a href={appHref(item.id)} class="card bg-base-100 shadow-sm transition hover:shadow-md">
						<div class="card-body">
							<div class="flex items-start justify-between gap-2">
								<h3 class="card-title flex items-center gap-2 text-lg">
									<ServiceIcon iconUrl={item.iconUrl} name={item.name} class="h-6 w-6" />
									{item.name}
								</h3>
								{#if item.category}
									<span class="badge badge-outline badge-sm shrink-0">{item.category}</span>
								{/if}
							</div>
							{#if item.tagline}
								<p class="text-sm text-base-content/70">{item.tagline}</p>
							{/if}
							<div class="card-actions justify-end">
								<span class="tooltip tooltip-primary tooltip-left" data-tip="View">
									<span
										class="btn btn-primary btn-square btn-sm pointer-events-none"
										aria-hidden="true"
									>
										<Eye class="h-4 w-4" />
									</span>
								</span>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</section>
	{/if}
{/if}
