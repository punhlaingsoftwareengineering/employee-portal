<script lang="ts">
	import { Building2 } from 'lucide-svelte';

	let {
		iconUrl = null,
		class: className = 'h-5 w-5'
	}: {
		iconUrl?: string | null;
		class?: string;
	} = $props();
</script>

{#if iconUrl}
	<img src={iconUrl} alt="" class="{className} rounded-sm object-contain" />
{:else}
	<Building2 class={className} />
{/if}
