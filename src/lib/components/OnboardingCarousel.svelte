<script lang="ts">
	import { onMount } from 'svelte';
	import { ChevronLeft, ChevronRight } from '@lucide/svelte';
	import { DEFAULT_ONBOARDING_CAROUSEL_INTERVAL_MS } from '$lib/constants/onboarding-carousel';

	type Slide = {
		id: string;
		title: string;
		description: string | null;
		imageUrl: string;
	};

	let {
		slides,
		showCaption = true,
		intervalMs = DEFAULT_ONBOARDING_CAROUSEL_INTERVAL_MS
	}: {
		slides: Slide[];
		showCaption?: boolean;
		intervalMs?: number;
	} = $props();

	let carouselEl = $state<HTMLDivElement | null>(null);
	let activeIndex = $state(0);
	let paused = false;

	function slideId(index: number): string {
		return `onboarding-slide-${index + 1}`;
	}

	function indexFromScroll(): number {
		if (!carouselEl || slides.length === 0) return 0;
		const left = carouselEl.scrollLeft;
		let best = 0;
		let bestDist = Number.POSITIVE_INFINITY;
		for (let i = 0; i < carouselEl.children.length; i++) {
			const child = carouselEl.children[i] as HTMLElement;
			const dist = Math.abs(child.offsetLeft - left);
			if (dist < bestDist) {
				bestDist = dist;
				best = i;
			}
		}
		return best;
	}

	function goTo(index: number, behavior: ScrollBehavior = 'smooth') {
		if (!carouselEl || slides.length === 0) return;
		const next = ((index % slides.length) + slides.length) % slides.length;
		activeIndex = next;
		const item = carouselEl.children[next] as HTMLElement | undefined;
		if (!item) return;
		carouselEl.scrollTo({ left: item.offsetLeft, behavior });
	}

	function goPrev() {
		goTo(indexFromScroll() - 1);
	}

	function goNext() {
		goTo(indexFromScroll() + 1);
	}

	function syncActiveFromScroll() {
		activeIndex = indexFromScroll();
	}

	onMount(() => {
		if (slides.length <= 1) return;

		const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduceMotion) return;

		const delay = Math.max(2000, intervalMs);

		const timer = window.setInterval(() => {
			if (paused) return;
			goTo(indexFromScroll() + 1, 'smooth');
		}, delay);

		return () => window.clearInterval(timer);
	});
</script>

<div
	bind:this={carouselEl}
	class="carousel w-full rounded-box bg-base-200 shadow-sm"
	role="region"
	aria-roledescription="carousel"
	aria-label="Onboarding carousel"
	onscroll={syncActiveFromScroll}
	onmouseenter={() => (paused = true)}
	onmouseleave={() => (paused = false)}
	onfocusin={() => (paused = true)}
	onfocusout={() => (paused = false)}
>
	{#each slides as slide, index (slide.id)}
		<div id={slideId(index)} class="carousel-item relative w-full">
			<figure class="relative w-full">
				<img
					src={slide.imageUrl}
					alt={slide.title}
					class="h-[28rem] w-full object-cover sm:h-[36rem] lg:h-[42rem]"
				/>
				{#if showCaption}
					<figcaption
						class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral/80 to-transparent px-6 py-8 text-neutral-content"
					>
						<h2 class="text-2xl font-bold sm:text-3xl">{slide.title}</h2>
						{#if slide.description}
							<p class="mt-2 max-w-2xl text-sm opacity-90 sm:text-base">{slide.description}</p>
						{/if}
					</figcaption>
				{/if}
			</figure>

			{#if slides.length > 1}
				<div class="absolute left-4 right-4 top-1/2 flex -translate-y-1/2 justify-between">
					<button
						type="button"
						class="btn btn-circle btn-sm bg-base-100/90"
						aria-label="Previous slide"
						aria-current={activeIndex === index ? 'true' : undefined}
						onclick={goPrev}
					>
						<ChevronLeft class="h-5 w-5" />
					</button>
					<button
						type="button"
						class="btn btn-circle btn-sm bg-base-100/90"
						aria-label="Next slide"
						onclick={goNext}
					>
						<ChevronRight class="h-5 w-5" />
					</button>
				</div>
			{/if}
		</div>
	{/each}
</div>
