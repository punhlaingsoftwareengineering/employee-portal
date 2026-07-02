<script lang="ts">
	import type { Component } from 'svelte';

	let {
		icon: Icon,
		title,
		description
	}: {
		icon: Component;
		title: string;
		description?: string;
	} = $props();
</script>

<header class="mb-6">
	<h2 class="flex items-center gap-2 text-2xl font-bold">
		<Icon class="h-6 w-6 text-primary" />
		{title}
	</h2>
	{#if description}
		<p class="mt-2 text-base-content/70">{description}</p>
	{/if}
</header>
