<script lang="ts">
	import ServiceIcon from '$lib/components/ServiceIcon.svelte';

	let {
		href,
		name,
		tagline = null,
		description = null,
		iconUrl = null,
		category = null,
		developer = null,
		version = null
	}: {
		href: string;
		name: string;
		tagline?: string | null;
		description?: string | null;
		iconUrl?: string | null;
		category?: string | null;
		developer?: string | null;
		version?: string | null;
	} = $props();

	const metaParts = $derived(
		[developer, version ? `v${version}` : null].filter(Boolean)
	);
	const subtitle = $derived(tagline ?? description);
</script>

<a href={href} class="app-card hover-3d w-full cursor-pointer" aria-label="View {name}">
	<figure class="app-card-face flex h-full flex-col rounded-3xl bg-base-100 p-4">
		<div class="flex items-start justify-between gap-1.5">
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-full bg-base-200"
			>
				<ServiceIcon {iconUrl} {name} class="h-6 w-6 rounded-md" />
			</div>
			{#if category}
				<span class="badge badge-ghost badge-xs shrink-0 text-[0.625rem]">{category}</span>
			{/if}
		</div>

		{#if metaParts.length > 0}
			<p class="mt-2 text-[0.625rem] leading-tight text-base-content/50">
				{metaParts.join(' · ')}
			</p>
		{/if}

		<h3 class="mt-1.5 line-clamp-2 text-sm font-bold leading-snug">{name}</h3>

		{#if subtitle}
			<p class="mt-1 line-clamp-2 flex-1 text-[0.6875rem] leading-snug text-base-content/60">
				{subtitle}
			</p>
		{:else}
			<div class="flex-1"></div>
		{/if}

		<div class="mt-2 flex justify-end">
			<span class="btn btn-primary btn-xs pointer-events-none">View</span>
		</div>
	</figure>

	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
	<div></div>
</a>
