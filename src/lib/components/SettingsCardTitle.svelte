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

<h2 class="card-title min-w-0 gap-2 text-lg {className}">
	<Icon class="h-5 w-5 shrink-0 text-primary" />
	<span class="min-w-0 wrap-break-word">{title}</span>
</h2>
