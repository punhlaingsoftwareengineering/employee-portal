<script lang="ts">
	import { ArrowRight } from 'lucide-svelte';
	import OnboardingCarousel from '$lib/components/OnboardingCarousel.svelte';
	import ToolsSections from '$lib/components/ToolsSections.svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';

	let { data } = $props();
</script>

{#if data.slides.length > 0}
	<section class="container mx-auto max-w-5xl px-4 py-8">
		<OnboardingCarousel slides={data.slides} />
		<div class="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
			<a href={AUTH_ROUTES.signup} class="btn btn-primary gap-2">
				Get started
				<ArrowRight class="h-4 w-4" />
			</a>
			<a href={AUTH_ROUTES.login} class="btn btn-outline">Sign in</a>
		</div>
	</section>
{:else}
	<section class="hero py-16">
		<div class="hero-content flex-col text-center">
			<div class="max-w-2xl">
				<h1 class="text-4xl font-bold">Welcome to Employee Portal</h1>
				<p class="py-6 text-lg opacity-80">
					Onboard your team, organize departments, and keep employee records in one secure place.
				</p>
				<div class="flex flex-col justify-center gap-3 sm:flex-row">
					<a href={AUTH_ROUTES.signup} class="btn btn-primary gap-2">
						Get started
						<ArrowRight class="h-4 w-4" />
					</a>
					<a href={AUTH_ROUTES.login} class="btn btn-outline">Sign in</a>
				</div>
			</div>
		</div>
	</section>
{/if}

{#if data.publicServices.length > 0 || data.publicApps.length > 0}
	<section class="container mx-auto max-w-5xl px-4 pb-16">
		<ToolsSections
			services={data.publicServices}
			apps={data.publicApps}
			appHref={(id) => `/onboarding/apps/${id}`}
			gridMaxCols={5}
		/>
	</section>
{/if}
