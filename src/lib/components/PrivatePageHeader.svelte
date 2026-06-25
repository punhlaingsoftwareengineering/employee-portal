<script lang="ts">
	import type { Component } from 'svelte';

	let {
		title,
		icon: Icon
	}: {
		title: string;
		icon?: Component;
	} = $props();
</script>

<header class="portal-sticky-page-header">
	<h1 class="portal-panel-header__title">
		{#if Icon}
			<Icon class="h-4 w-4 shrink-0" />
		{/if}
		{title}
	</h1>
</header>
