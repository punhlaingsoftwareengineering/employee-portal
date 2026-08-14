<script lang="ts">
	import { ArrowLeft, Newspaper } from '@lucide/svelte';
	import OnboardingNewsletterGrid from '$lib/components/OnboardingNewsletterGrid.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';
	import { PUBLIC_ROUTES } from '$lib/constants/public-routes';

	let { data } = $props();
</script>

<PageTitle title="Newsletters" />

<div class="container mx-auto max-w-5xl px-4 py-4">
	<a href={PUBLIC_ROUTES.onboarding} class="btn btn-ghost btn-sm mb-4 gap-2">
		<ArrowLeft class="h-4 w-4" />
		Back to onboarding
	</a>

	<SectionHead
		icon={Newspaper}
		title="Newsletters"
		description="All newsletters in serial order. Open a paper to view the full edition."
	/>

	{#if data.newsletters.length === 0}
		<p class="text-sm text-base-content/60">No newsletters yet.</p>
	{:else}
		<OnboardingNewsletterGrid newsletters={data.newsletters} />
	{/if}
</div>
