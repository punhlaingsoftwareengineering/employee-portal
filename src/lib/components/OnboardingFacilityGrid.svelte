<script lang="ts">
	import { Building2, MapPin, Phone } from '@lucide/svelte';
	import type { Facility } from '$lib/server/db/schema/facility';

	let { facilities }: { facilities: Facility[] } = $props();
</script>

<ul class="onboarding-facility-grid">
	{#each facilities as item (item.id)}
		<li>
			<button type="button" class="onboarding-facility-card group">
				<div class="onboarding-facility-media">
				{#if item.imageUrl}
					<img
						src={item.imageUrl}
						alt={item.name}
						class="onboarding-facility-image"
						loading="lazy"
					/>
				{:else}
					<div class="onboarding-facility-placeholder" aria-hidden="true">
						<Building2 class="h-12 w-12 text-base-content/25" />
					</div>
				{/if}

				<div class="onboarding-facility-caption">
					<p class="text-sm font-semibold leading-snug">{item.name}</p>
				</div>

				<div class="onboarding-facility-overlay">
					<div class="onboarding-facility-overlay-content">
						<h3 class="text-lg font-bold leading-tight">{item.name}</h3>
						{#if item.address?.trim()}
							<p class="mt-3 flex items-start gap-2 text-sm text-white/85">
								<MapPin class="mt-0.5 h-4 w-4 shrink-0" />
								<span>{item.address}</span>
							</p>
						{/if}
						{#if item.phone}
							<p class="mt-3 flex items-center gap-2 text-sm text-white/85">
								<Phone class="h-4 w-4 shrink-0" />
								<span>{item.phone}</span>
							</p>
						{/if}
					</div>
				</div>
				</div>
			</button>
		</li>
	{/each}
</ul>

<style>
	.onboarding-facility-grid {
		display: grid;
		grid-template-columns: repeat(1, minmax(0, 1fr));
		gap: 1rem;
		list-style: none;
		padding: 0;
		margin: 0;
	}

	@media (min-width: 640px) {
		.onboarding-facility-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.onboarding-facility-grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}
	}

	.onboarding-facility-card {
		display: block;
		width: 100%;
		text-align: left;
		border-radius: 1rem;
		overflow: hidden;
		box-shadow:
			0 1px 2px rgb(0 0 0 / 0.14),
			0 6px 16px rgb(0 0 0 / 0.12);
	}

	.onboarding-facility-media {
		position: relative;
		aspect-ratio: 4 / 3;
		overflow: hidden;
		background-color: var(--color-base-300);
	}

	.onboarding-facility-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 300ms ease;
	}

	.onboarding-facility-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		height: 100%;
		background: linear-gradient(135deg, var(--color-base-300), var(--color-base-200));
	}

	.onboarding-facility-caption {
		position: absolute;
		inset-inline: 0;
		bottom: 0;
		padding: 0.75rem 1rem;
		background: linear-gradient(to top, rgb(0 0 0 / 0.78), transparent);
		color: #fff;
		transition: opacity 200ms ease;
	}

	.onboarding-facility-card:hover .onboarding-facility-caption,
	.onboarding-facility-card:focus-within .onboarding-facility-caption {
		opacity: 0;
	}

	.onboarding-facility-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: flex-end;
		padding: 1rem;
		background: linear-gradient(
			to top,
			rgb(0 0 0 / 0.88) 0%,
			rgb(0 0 0 / 0.55) 45%,
			rgb(0 0 0 / 0.15) 100%
		);
		color: #fff;
		opacity: 0;
		transition: opacity 250ms ease;
	}

	.onboarding-facility-card:hover .onboarding-facility-image,
	.onboarding-facility-card:focus-within .onboarding-facility-image {
		transform: scale(1.05);
	}

	.onboarding-facility-card:hover .onboarding-facility-overlay,
	.onboarding-facility-card:focus-within .onboarding-facility-overlay {
		opacity: 1;
	}

	.onboarding-facility-overlay-content {
		width: 100%;
		max-height: 100%;
		overflow: auto;
	}
</style>
