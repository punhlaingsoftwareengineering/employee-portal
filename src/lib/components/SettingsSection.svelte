<script lang="ts">
	import type { Component, Snippet } from 'svelte';

	let {
		id,
		icon: Icon,
		title,
		description,
		children
	}: {
		id: string;
		icon: Component;
		title: string;
		description?: string;
		children: Snippet;
	} = $props();
</script>

<section {id} class="settings-section scroll-mt-24">
	<header class="settings-section__head">
		<div class="settings-section__icon" aria-hidden="true">
			<Icon class="h-5 w-5" />
		</div>
		<div class="min-w-0">
			<h2 class="settings-section__title">{title}</h2>
			{#if description}
				<p class="settings-section__desc">{description}</p>
			{/if}
		</div>
	</header>
	<div class="settings-section__body">
		{@render children()}
	</div>
</section>
