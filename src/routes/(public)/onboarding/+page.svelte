<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { Building2, Newspaper, Pill } from '@lucide/svelte';
	import OnboardingCarousel from '$lib/components/OnboardingCarousel.svelte';
	import OnboardingFacilityGrid from '$lib/components/OnboardingFacilityGrid.svelte';
	import OnboardingFacilityTabs from '$lib/components/OnboardingFacilityTabs.svelte';
	import OnboardingNewsletterGrid from '$lib/components/OnboardingNewsletterGrid.svelte';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';
	import ToolsSections from '$lib/components/ToolsSections.svelte';
	import { ONBOARDING_SECTION_IDS } from '$lib/constants/onboarding';
	import { publicAppHref } from '$lib/constants/public-routes';

	let { data } = $props();

	function scrollToHashSection() {
		const hash = window.location.hash.slice(1);
		if (!hash) return;

		const target = document.getElementById(hash);
		target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	onMount(() => {
		scrollToHashSection();
		window.addEventListener('hashchange', scrollToHashSection);
		return () => window.removeEventListener('hashchange', scrollToHashSection);
	});

	afterNavigate(() => {
		scrollToHashSection();
	});
</script>

<PageTitle />

{#if data.slides.length > 0}
	<section class="container mx-auto max-w-5xl px-4 py-8">
		<OnboardingCarousel
			slides={data.slides}
			showCaption={false}
			intervalMs={data.carouselIntervalMs}
		/>
	</section>
{:else}
	<section class="hero py-16">
		<div class="hero-content flex-col text-center">
			<div class="max-w-2xl">
				<h1 class="text-4xl font-bold">Welcome to Employee Portal</h1>
				<p class="py-6 text-lg opacity-80">
					Onboard your team, organize departments, and keep employee records in one secure place.
				</p>
			</div>
		</div>
	</section>
{/if}

{#if data.publicServices.length > 0 || data.publicApps.length > 0}
	<section class="container mx-auto max-w-5xl px-4 pb-16">
		<ToolsSections
			services={data.publicServices}
			apps={data.publicApps}
			appHref={publicAppHref}
			gridMaxCols={5}
			sectionHeadStyle="onboarding"
		/>
	</section>
{/if}

<section
	id={ONBOARDING_SECTION_IDS.pharmacyMaster}
	class="container mx-auto max-w-5xl scroll-mt-24 px-4 pb-16"
>
	<SectionHead
		icon={Pill}
		title="Pharmacy Master"
		description="Browse pharmacy items by facility: Hlaing Thar Yar, Mandalay, and Taung Gyi."
	/>
	<OnboardingFacilityTabs items={data.pharmacyMasters} />
</section>

{#if data.newsletters.length > 0}
	<section
		id={ONBOARDING_SECTION_IDS.newsletters}
		class="container mx-auto max-w-5xl scroll-mt-24 px-4 pb-16"
	>
		<SectionHead
			icon={Newspaper}
			title="Newsletters"
			description="Latest PDF newsletters. Open a paper to read the full edition."
		/>
		<OnboardingNewsletterGrid newsletters={data.newsletters} />
	</section>
{/if}

{#if data.facilities.length > 0}
	<section class="container mx-auto max-w-5xl px-4 pb-16">
		<SectionHead
			icon={Building2}
			title="Facilities"
			description="Explore hospital locations. Hover a card for details."
		/>
		<OnboardingFacilityGrid facilities={data.facilities} />
	</section>
{/if}
