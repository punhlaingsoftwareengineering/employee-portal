<script lang="ts">
	import type { Component } from 'svelte';

	let {
		icon: Icon,
		title,
		class: className = ''
	}: {
		icon: Component;
		title: string;
		class?: string;
	} = $props();
</script>

<h3 class="card-title min-w-0 gap-2.5 text-base font-bold text-base-content {className}">
	<span
		class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
		aria-hidden="true"
	>
		<Icon class="h-4 w-4" />
	</span>
	<span class="min-w-0 wrap-break-word">{title}</span>
</h3>
