<script lang="ts">
	import { onMount } from 'svelte';
	import { ExternalLink } from '@lucide/svelte';
	import { COMMUNITY_PLATFORM_LABELS } from '$lib/constants/community';
	import type { CommunityLink } from '$lib/server/db/schema/community-link';
	import {
		getCommunityPlatformColorClass,
		getCommunityPlatformIcon
	} from '$lib/utils/community-platform';

	let { link }: { link: CommunityLink } = $props();

	const PlatformIcon = $derived(getCommunityPlatformIcon(link.platform));
	const platformColorClass = $derived(getCommunityPlatformColorClass(link.platform));

	let qrDataUrl = $state<string | null>(null);

	onMount(async () => {
		if (!link.showQr) return;

		try {
			const QRCode = (await import('qrcode')).default;
			qrDataUrl = await QRCode.toDataURL(link.url, {
				width: 128,
				margin: 1,
				color: {
					dark: '#000000',
					light: '#ffffff'
				}
			});
		} catch {
			qrDataUrl = null;
		}
	});
</script>

<article class="card bg-base-100 shadow-sm transition-shadow hover:shadow-md">
	<div class="card-body gap-4">
		<div class="flex items-start gap-3">
			<div
				class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white {platformColorClass}"
			>
				<PlatformIcon class="h-6 w-6" />
			</div>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<h3 class="text-lg font-bold leading-tight">{link.title}</h3>
					<span class="badge badge-outline badge-sm">
						{COMMUNITY_PLATFORM_LABELS[link.platform]}
					</span>
				</div>
				{#if link.description}
					<p class="mt-2 text-sm leading-relaxed text-base-content/70">{link.description}</p>
				{/if}
			</div>
		</div>

		<div class="flex flex-wrap items-end justify-between gap-4">
			<a
				href={link.url}
				target="_blank"
				rel="noopener noreferrer"
				class="btn btn-primary btn-sm gap-2"
			>
				Open link
				<ExternalLink class="h-4 w-4" />
			</a>

			{#if link.showQr && qrDataUrl}
				<div class="rounded-box border border-base-300 bg-base-100 p-2">
					<img
						src={qrDataUrl}
						alt="QR code for {link.title}"
						class="h-24 w-24"
						width="96"
						height="96"
					/>
				</div>
			{/if}
		</div>
	</div>
</article>
