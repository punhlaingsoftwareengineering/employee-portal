<script lang="ts">
	import { ExternalLink, Globe } from 'lucide-svelte';
	import ServiceLinkStatus from '$lib/components/ServiceLinkStatus.svelte';
	import { accentGradientBackground } from '$lib/utils/accent-gradient';

	let {
		name,
		description = null,
		link,
		iconUrl = null,
		category = null,
		accentColor = null,
		linkStatus = 'checking'
	}: {
		name: string;
		description?: string | null;
		link: string;
		iconUrl?: string | null;
		category?: string | null;
		accentColor?: string | null;
		linkStatus?: 'checking' | 'up' | 'down';
	} = $props();

	let imageFailed = $state(false);

	const categoryLabel = $derived((category?.trim() || 'SERVICE').toUpperCase());
	const cardBackground = $derived(accentGradientBackground(accentColor));
</script>

<a
	href={link}
	target="_blank"
	rel="noopener noreferrer"
	class="service-card hover-3d w-full cursor-pointer"
	aria-label="Open {name}"
>
	<figure class="service-card-figure relative aspect-[4/3] rounded-2xl" style:background={cardBackground}>
		<div class="relative flex h-full flex-col p-2.5 pr-[42%] text-white">
			<div class="flex items-center gap-1 text-[0.5rem] font-semibold tracking-[0.14em] text-white/85">
				<ServiceLinkStatus status={linkStatus} />
				<span class="truncate">{categoryLabel}</span>
			</div>

			<div class="relative z-10 mt-1 min-h-0 flex-1">
				<h3 class="service-card-title line-clamp-2 text-sm font-extrabold leading-tight tracking-tight">
					{name}
				</h3>
				{#if description}
					<p class="mt-0.5 line-clamp-1 text-[0.6rem] leading-snug text-white/75">{description}</p>
				{/if}
			</div>

			<span
				class="relative z-10 mt-auto inline-flex w-fit items-center gap-1 text-[0.6rem] font-medium text-white/90"
			>
				Open
				<ExternalLink class="h-2.5 w-2.5" />
			</span>
		</div>

		<div
			class="pointer-events-none absolute right-2.5 bottom-2.5 flex w-[40%] max-h-[55%] items-end justify-end"
		>
			{#if iconUrl && !imageFailed}
				<img
					src={iconUrl}
					alt=""
					class="max-h-full max-w-full object-contain drop-shadow-md"
					onerror={() => {
						imageFailed = true;
					}}
				/>
			{:else}
				<Globe class="h-14 w-14 text-white/20" />
			{/if}
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
