<script lang="ts">
	import { Pin } from '@lucide/svelte';
	import ServiceIcon from '$lib/components/ServiceIcon.svelte';

	let {
		href,
		name,
		tagline = null,
		description = null,
		iconUrl = null,
		category = null,
		developer = null,
		version = null,
		pinned = false,
		showPin = false,
		onPinToggle
	}: {
		href: string;
		name: string;
		tagline?: string | null;
		description?: string | null;
		iconUrl?: string | null;
		category?: string | null;
		developer?: string | null;
		version?: string | null;
		pinned?: boolean;
		showPin?: boolean;
		onPinToggle?: () => void;
	} = $props();

	const metaParts = $derived(
		[developer, version ? `v${version}` : null].filter(Boolean)
	);
	const subtitle = $derived(tagline ?? description);

	function handlePinClick(event: MouseEvent) {
		event.preventDefault();
		event.stopPropagation();
		onPinToggle?.();
	}
</script>

<div class="relative w-full">
	{#if showPin}
		<button
			type="button"
			class="btn btn-circle btn-xs absolute top-2 right-2 z-20 border border-base-300 bg-base-100/90 shadow-sm backdrop-blur-sm"
			class:btn-primary={pinned}
			class:btn-ghost={!pinned}
			aria-label={pinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
			aria-pressed={pinned}
			onclick={handlePinClick}
		>
			<Pin class="h-3.5 w-3.5 {pinned ? 'fill-current' : ''}" />
		</button>
	{/if}

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
</div>
