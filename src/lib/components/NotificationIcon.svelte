<script lang="ts">
	import type { PublicNotification } from '$lib/schemas/notification';
	import * as icons from 'lucide-svelte';
	import { Bell } from 'lucide-svelte';

	let {
		notification,
		sizeClass = 'h-4 w-4'
	}: {
		notification: Pick<PublicNotification, 'iconName' | 'imageUrl' | 'title'>;
		sizeClass?: string;
	} = $props();

	function toPascalCase(value: string) {
		return value
			.split(/[-_\s]+/)
			.filter(Boolean)
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join('');
	}

	const Icon = $derived.by(() => {
		if (!notification.iconName?.trim()) return Bell;
		const key = toPascalCase(notification.iconName.trim());
		const candidate = (icons as Record<string, typeof Bell>)[key];
		return candidate ?? Bell;
	});
</script>

{#if notification.imageUrl}
	<img src={notification.imageUrl} alt="" class="h-8 w-8 shrink-0 rounded object-cover" />
{:else}
	<Icon class="{sizeClass} shrink-0" />
{/if}
