<script lang="ts">
	import { Globe } from '@lucide/svelte';

	let {
		iconUrl = null,
		name,
		class: className = 'h-4 w-4'
	}: {
		iconUrl?: string | null;
		name: string;
		class?: string;
	} = $props();

	let imageFailed = $state(false);
</script>

{#if iconUrl && !imageFailed}
	<img
		src={iconUrl}
		alt=""
		class="{className} rounded-sm object-contain"
		onerror={() => {
			imageFailed = true;
		}}
	/>
{:else}
	<Globe class={className} />
{/if}
