<script lang="ts">
	import PublicFooter from '$lib/components/PublicFooter.svelte';
	import PublicNavbar from '$lib/components/PublicNavbar.svelte';
	import AnnouncementBanner from '$lib/components/AnnouncementBanner.svelte';

	let { data, children } = $props();
</script>

<div class="flex min-h-screen flex-col bg-base-200">
	{#if data.announcement}
		<AnnouncementBanner announcement={data.announcement} />
	{/if}
	<PublicNavbar />
	<main class="flex-1">
		{@render children?.()}
	</main>
	<PublicFooter />
</div>
