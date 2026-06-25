<script lang="ts">
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	type Slide = {
		id: string;
		title: string;
		description: string | null;
		imageUrl: string;
	};

	let { slides }: { slides: Slide[] } = $props();

	function slideId(index: number): string {
		return `onboarding-slide-${index + 1}`;
	}

	function prevHref(index: number): string {
		const target = index === 0 ? slides.length : index;
		return `#${slideId(target - 1)}`;
	}

	function nextHref(index: number): string {
		const target = index === slides.length - 1 ? 1 : index + 2;
		return `#${slideId(target - 1)}`;
	}
</script>

<div class="carousel w-full rounded-box bg-base-200 shadow-sm">
	{#each slides as slide, index (slide.id)}
		<div id={slideId(index)} class="carousel-item relative w-full">
			<figure class="relative w-full">
				<img
					src={slide.imageUrl}
					alt={slide.title}
					class="h-72 w-full object-cover sm:h-96"
				/>
				<figcaption
					class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-neutral/80 to-transparent px-6 py-8 text-neutral-content"
				>
					<h2 class="text-2xl font-bold sm:text-3xl">{slide.title}</h2>
					{#if slide.description}
						<p class="mt-2 max-w-2xl text-sm opacity-90 sm:text-base">{slide.description}</p>
					{/if}
				</figcaption>
			</figure>

			{#if slides.length > 1}
				<div
					class="absolute left-4 right-4 top-1/2 flex -translate-y-1/2 justify-between"
				>
					<a
						href={prevHref(index)}
						class="btn btn-circle btn-sm bg-base-100/90"
						aria-label="Previous slide"
					>
						<ChevronLeft class="h-5 w-5" />
					</a>
					<a
						href={nextHref(index)}
						class="btn btn-circle btn-sm bg-base-100/90"
						aria-label="Next slide"
					>
						<ChevronRight class="h-5 w-5" />
					</a>
				</div>
			{/if}
		</div>
	{/each}
</div>
