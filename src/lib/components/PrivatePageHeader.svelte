<script lang="ts">
	import type { Component } from 'svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';

	let {
		title,
		icon: Icon,
		titlePrefix
	}: {
		title: string;
		icon?: Component;
		titlePrefix?: string;
	} = $props();
</script>

<PageTitle {title} prefix={titlePrefix} />

<header class="portal-sticky-page-header">
	<h1 class="portal-panel-header__title">
		{#if Icon}
			<Icon class="h-4 w-4 shrink-0" />
		{/if}
		{title}
	</h1>
</header>
