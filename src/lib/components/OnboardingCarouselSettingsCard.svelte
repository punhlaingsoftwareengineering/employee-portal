<script lang="ts">
	import { page } from '$app/state';
	import { Timer } from '@lucide/svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import OnboardingCarouselSpeedForm from '$lib/components/OnboardingCarouselSpeedForm.svelte';
	import SettingsCardTitle from '$lib/components/SettingsCardTitle.svelte';
	import { getOnboardingCarouselConfig } from '$lib/remotes/onboarding-carousel-config.remote';

	const isAdmin = $derived(page.data.permissions?.isAdmin ?? false);
</script>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<svelte:boundary>
			{@const carouselConfig = await getOnboardingCarouselConfig()}

			<SettingsCardTitle icon={Timer} title="Carousel animation" />
			<p class="mb-4 text-sm text-base-content/70">
				Auto-advance speed for the public onboarding carousel (left to right).
			</p>

			{#if isAdmin}
				<OnboardingCarouselSpeedForm initialIntervalMs={carouselConfig.intervalMs} />
			{:else}
				<p class="text-sm">
					Current interval:
					<span class="font-medium">{carouselConfig.intervalMs / 1000}s</span>
				</p>
			{/if}

			{#snippet pending()}
				<SettingsCardTitle icon={Timer} title="Carousel animation" class="mb-4" />
				<LoadingCenter />
			{/snippet}

			{#snippet failed(loadError)}
				<div class="alert alert-error">
					<span>
						{loadError instanceof Error ? loadError.message : 'Failed to load carousel settings'}
					</span>
				</div>
			{/snippet}
		</svelte:boundary>
	</div>
</div>
