<script lang="ts">
	import PublicFooter from '$lib/components/PublicFooter.svelte';
	import PublicNavbar from '$lib/components/PublicNavbar.svelte';

	let { children } = $props();
</script>

<div class="flex min-h-screen flex-col bg-base-200">
	<PublicNavbar />
	<main class="flex-1">{@render children()}</main>
	<PublicFooter />
</div>
