<script lang="ts">
	import { Building2 } from '@lucide/svelte';
	import { normalizePublicDriveUrl } from '$lib/utils/drive-public-url';

	let {
		iconUrl = null,
		class: className = 'h-5 w-5'
	}: {
		iconUrl?: string | null;
		class?: string;
	} = $props();

	const src = $derived(normalizePublicDriveUrl(iconUrl));
</script>

{#if src}
	<img src={src} alt="" class="{className} rounded-sm object-contain" />
{:else}
	<Building2 class={className} />
{/if}
