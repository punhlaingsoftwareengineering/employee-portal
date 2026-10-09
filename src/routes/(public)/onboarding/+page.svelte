<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { Building2, Newspaper, Pill } from '@lucide/svelte';
	import OnboardingCarousel from '$lib/components/OnboardingCarousel.svelte';
	import OnboardingFacilityGrid from '$lib/components/OnboardingFacilityGrid.svelte';
	import OnboardingFacilityTabs from '$lib/components/OnboardingFacilityTabs.svelte';
	import OnboardingNewsletterGrid from '$lib/components/OnboardingNewsletterGrid.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import SectionHead from '$lib/components/SectionHead.svelte';
	import ToolsSections from '$lib/components/ToolsSections.svelte';
	import DailyPopupDialog from '$lib/components/DailyPopupDialog.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import {
		ONBOARDING_NEWSLETTER_DISPLAY_LIMIT,
		ONBOARDING_SECTION_IDS
	} from '$lib/constants/onboarding';
	import { PUBLIC_ROUTES, publicAppHref } from '$lib/constants/public-routes';
	import { pageSeo } from '$lib/constants/seo';

	let { data } = $props();

	const seo = pageSeo.onboarding;

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

<SeoHead
	title={seo.title}
	description={seo.description}
	path={PUBLIC_ROUTES.onboarding}
	jsonLdType="WebPage"
/>

<!-- Popup data is awaited server-side; opens before streamed page content finishes. -->
<DailyPopupDialog payload={data.dailyPopup} />

{#await data.content}
	<section class="container mx-auto max-w-5xl px-4 pt-4 pb-6" aria-busy="true">
		<div class="aspect-[21/9] w-full animate-pulse rounded-box bg-base-300"></div>
	</section>
	<section class="container mx-auto max-w-5xl px-4 pb-8">
		<LoadingCenter />
	</section>
{:then content}
	{#if content.slides.length > 0}
		<section class="container mx-auto max-w-5xl px-4 pt-4 pb-6">
			<OnboardingCarousel
				slides={content.slides}
				showCaption={false}
				intervalMs={content.carouselIntervalMs}
			/>
		</section>
	{:else}
		<section class="hero py-8">
			<div class="hero-content flex-col text-center">
				<div class="max-w-2xl">
					<h1 class="text-4xl font-bold">Welcome to Employee Portal</h1>
					<p class="py-3 text-lg opacity-80">
						Onboard your team, organize departments, and keep employee records in one secure place.
					</p>
				</div>
			</div>
		</section>
	{/if}

	{#if content.publicServices.length > 0 || content.publicApps.length > 0}
		<section class="container mx-auto max-w-5xl px-4 pb-8">
			<ToolsSections
				services={content.publicServices}
				apps={content.publicApps}
				appHref={publicAppHref}
				gridMaxCols={5}
				sectionHeadStyle="onboarding"
			/>
		</section>
	{/if}

	<section
		id={ONBOARDING_SECTION_IDS.pharmacyMaster}
		class="container mx-auto max-w-5xl scroll-mt-20 px-4 pb-8"
	>
		<SectionHead
			icon={Pill}
			title="Pharmacy Master"
			description="Browse pharmacy items by facility: Hlaing Thar Yar, Mandalay, and Taung Gyi."
		/>
		<OnboardingFacilityTabs items={content.pharmacyMasters} />
	</section>

	{#if content.newsletters.length > 0}
		<section
			id={ONBOARDING_SECTION_IDS.newsletters}
			class="container mx-auto max-w-5xl scroll-mt-20 px-4 pb-8"
		>
			<SectionHead
				icon={Newspaper}
				title="Newsletters"
				description="Latest newsletters as PDF or image. Open a paper to view the full edition."
			/>
			<OnboardingNewsletterGrid newsletters={content.newsletters} />
			{#if content.newsletterTotal > ONBOARDING_NEWSLETTER_DISPLAY_LIMIT}
				<div class="mt-4 flex justify-center">
					<a href={PUBLIC_ROUTES.newsletters} class="btn btn-ghost btn-sm cursor-pointer"
						>See more</a
					>
				</div>
			{/if}
		</section>
	{/if}

	{#if content.facilities.length > 0}
		<section class="container mx-auto max-w-5xl px-4 pb-8">
			<SectionHead
				icon={Building2}
				title="Facilities"
				description="Explore hospital locations. Hover a card for details."
			/>
			<OnboardingFacilityGrid facilities={content.facilities} />
		</section>
	{/if}
{:catch}
	<section class="container mx-auto max-w-5xl px-4 py-8">
		<div class="alert alert-error">
			<span>Failed to load onboarding content. Refresh to try again.</span>
		</div>
	</section>
{/await}
