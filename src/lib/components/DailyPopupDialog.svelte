<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { X } from '@lucide/svelte';
	import {
		DAILY_POPUP_DISMISSED_AT_KEY,
		DAILY_POPUP_FORCE_QUERY,
		shouldShowDailyPopup
	} from '$lib/constants/daily-popup';
	import { IMAGE_ASPECT } from '$lib/constants/image-aspect';
	import type { DailyPopupPublicPayload } from '$lib/schemas/daily-popup';

	let {
		payload
	}: {
		payload: DailyPopupPublicPayload | null | undefined;
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let activeIndex = $state(0);
	let trackEl = $state<HTMLDivElement | null>(null);
	let intervalId: ReturnType<typeof setInterval> | null = null;
	let didAutoOpen = $state(false);
	let openedOnce = $state(false);

	const images = $derived(payload?.images ?? []);
	const firstImageUrl = $derived(images[0]?.imageUrl ?? null);
	const aspect = IMAGE_ASPECT.dailyPopup;
	const multi = $derived(images.length > 1);
	const cooldownMinutes = $derived(payload?.dismissCooldownMinutes ?? 15);
	const carouselIntervalMs = $derived(payload?.carouselIntervalMs ?? 5000);

	function shouldForceOpen(): boolean {
		return page.url.searchParams.get(DAILY_POPUP_FORCE_QUERY) === '1';
	}

	function readDismissedAt(): string | null {
		if (!browser) return null;
		return localStorage.getItem(DAILY_POPUP_DISMISSED_AT_KEY);
	}

	function markDismissed() {
		if (browser) {
			localStorage.setItem(DAILY_POPUP_DISMISSED_AT_KEY, new Date().toISOString());
		}
	}

	export function open() {
		if (!dialog || dialog.open) {
			if (dialog?.open) {
				openedOnce = true;
				startCarousel();
			}
			return;
		}
		try {
			dialog.showModal();
			openedOnce = true;
			dialog.dataset.opened = '1';
			startCarousel();
		} catch (err) {
			console.warn('[daily-popup] showModal failed', err);
		}
	}

	function dismiss() {
		if (openedOnce) markDismissed();
		stopCarousel();
		dialog?.close();
	}

	function onDialogClose() {
		if (openedOnce) markDismissed();
		stopCarousel();
	}

	function goTo(index: number) {
		if (!multi || !trackEl) return;
		const next = ((index % images.length) + images.length) % images.length;
		activeIndex = next;
		const child = trackEl.children[next] as HTMLElement | undefined;
		if (child) {
			trackEl.scrollTo({ left: child.offsetLeft, behavior: 'smooth' });
		}
	}

	function startCarousel() {
		stopCarousel();
		if (!multi) return;
		if (browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const delay = Math.max(2000, carouselIntervalMs);
		intervalId = setInterval(() => goTo(activeIndex + 1), delay);
	}

	function stopCarousel() {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	}

	function onTrackScroll() {
		if (!trackEl || !multi) return;
		const left = trackEl.scrollLeft;
		let best = 0;
		let bestDist = Infinity;
		for (let i = 0; i < trackEl.children.length; i++) {
			const child = trackEl.children[i] as HTMLElement;
			const dist = Math.abs(child.offsetLeft - left);
			if (dist < bestDist) {
				bestDist = dist;
				best = i;
			}
		}
		activeIndex = best;
	}

	function tryAutoOpen() {
		if (!browser || didAutoOpen || images.length === 0 || !dialog) return;

		/** Inline script may have already opened before hydration. */
		if (dialog.open || dialog.dataset.opened === '1') {
			didAutoOpen = true;
			openedOnce = true;
			startCarousel();
			return;
		}

		const force = shouldForceOpen();
		const show = force || shouldShowDailyPopup(readDismissedAt(), cooldownMinutes);
		didAutoOpen = true;
		if (!show) return;
		open();
	}

	function mountToViewportRoot() {
		if (!browser || !dialog) return;
		if (dialog.parentElement !== document.body) {
			document.body.appendChild(dialog);
		}
	}

	onMount(() => {
		mountToViewportRoot();
		tryAutoOpen();
		return () => {
			stopCarousel();
			if (dialog?.parentElement === document.body) {
				dialog.remove();
			}
		};
	});

	$effect(() => {
		void dialog;
		void images.length;
		mountToViewportRoot();
		tryAutoOpen();
	});

</script>

<svelte:head>
	{#if firstImageUrl}
		<link rel="preload" as="image" href={firstImageUrl} />
	{/if}
</svelte:head>

{#if images.length > 0}
	<dialog
		id="daily-popup-dialog"
		bind:this={dialog}
		class="daily-popup-modal"
		aria-label="Daily notice"
		data-cooldown={String(cooldownMinutes)}
		onclose={onDialogClose}
	>
		<form method="dialog" class="daily-popup-backdrop">
			<button class="cursor-pointer" aria-label="Close">close</button>
		</form>

		<div class="daily-popup-shell">
			<button
				type="button"
				class="btn btn-error btn-circle btn-sm daily-popup__close cursor-pointer"
				aria-label="Close"
				onclick={dismiss}
			>
				<X class="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} aria-hidden="true" />
			</button>

			<div
				class="daily-popup"
				style:aspect-ratio="{aspect.width} / {aspect.height}"
			>
				{#if multi}
					<div
						bind:this={trackEl}
						class="carousel daily-popup__carousel w-full"
						onscroll={onTrackScroll}
					>
						{#each images as image, i (image.id)}
							<div class="carousel-item daily-popup__slide w-full">
								{#if image.linkUrl}
									<a
										href={image.linkUrl}
										class="daily-popup__media cursor-pointer"
										target="_blank"
										rel="noopener noreferrer"
									>
										<img
											src={image.imageUrl}
											alt="Daily notice {i + 1}"
											class="daily-popup__img"
											fetchpriority={i === 0 ? 'high' : 'auto'}
											loading={i === 0 ? 'eager' : 'lazy'}
										/>
									</a>
								{:else}
									<div class="daily-popup__media">
										<img
											src={image.imageUrl}
											alt="Daily notice {i + 1}"
											class="daily-popup__img"
											fetchpriority={i === 0 ? 'high' : 'auto'}
											loading={i === 0 ? 'eager' : 'lazy'}
										/>
									</div>
								{/if}
							</div>
						{/each}
					</div>
					<div class="daily-popup__dots" role="tablist" aria-label="Slides">
						{#each images as _, i (i)}
							<button
								type="button"
								class="daily-popup__dot cursor-pointer"
								class:daily-popup__dot--active={activeIndex === i}
								aria-label="Go to slide {i + 1}"
								aria-selected={activeIndex === i}
								onclick={() => goTo(i)}
							></button>
						{/each}
					</div>
				{:else}
					{@const image = images[0]!}
					{#if image.linkUrl}
						<a
							href={image.linkUrl}
							class="daily-popup__media cursor-pointer"
							target="_blank"
							rel="noopener noreferrer"
						>
							<img
								src={image.imageUrl}
								alt="Daily notice"
								class="daily-popup__img"
								fetchpriority="high"
								loading="eager"
							/>
						</a>
					{:else}
						<div class="daily-popup__media">
							<img
								src={image.imageUrl}
								alt="Daily notice"
								class="daily-popup__img"
								fetchpriority="high"
								loading="eager"
							/>
						</div>
					{/if}
				{/if}
			</div>
		</div>
	</dialog>
{/if}

<style>
	/* Full browser viewport flex center (ignores page content behind). */
	:global(dialog.daily-popup-modal) {
		position: fixed;
		inset: 0;
		z-index: 9999;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100vw;
		max-width: none;
		height: 100dvh;
		max-height: none;
		margin: 0;
		padding: 0;
		border: none;
		background: oklch(0% 0 0 / 0.45);
		overflow: visible;
		color: inherit;
	}

	:global(dialog.daily-popup-modal:not([open])) {
		display: none;
	}

	:global(dialog.daily-popup-modal::backdrop) {
		background: transparent;
	}

	.daily-popup-shell {
		position: relative;
		z-index: 1;
		box-sizing: border-box;
		flex-shrink: 0;
		width: min(72rem, calc(100vw - 3rem));
		max-width: min(72rem, calc(100vw - 3rem));
		margin: 0;
		padding: 0.875rem;
		overflow: visible;
	}

	.daily-popup {
		position: relative;
		display: flex;
		width: 100%;
		max-width: 100%;
		max-height: min(calc(72rem * 9 / 16), calc(100dvh - 4rem));
		overflow: hidden;
		margin: 0;
		border-radius: var(--radius-box, 1rem);
		border: 1px solid color-mix(in oklab, var(--color-base-content) 10%, transparent);
		background: var(--color-base-300);
		opacity: 1;
		scale: 1;
		translate: none;
		box-shadow:
			0 1px 2px color-mix(in oklab, var(--color-base-content) 6%, transparent),
			0 24px 48px -16px color-mix(in oklab, var(--color-base-content) 28%, transparent);
	}

	.daily-popup__close {
		position: absolute;
		top: 0.875rem;
		right: 0.875rem;
		z-index: 20;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.75rem;
		height: 1.75rem;
		min-height: 1.75rem;
		padding: 0;
		transform: translate(50%, -50%);
		box-shadow: 0 3px 10px color-mix(in oklab, var(--color-error) 35%, transparent);
	}

	.daily-popup-backdrop {
		position: absolute;
		inset: 0;
		z-index: 0;
		margin: 0;
		border: none;
		padding: 0;
		background: transparent;
	}

	.daily-popup-backdrop button {
		display: block;
		width: 100%;
		height: 100%;
		border: none;
		background: transparent;
		color: transparent;
		cursor: pointer;
	}

	.daily-popup__carousel {
		height: 100%;
		scroll-snap-type: x mandatory;
	}

	.daily-popup__slide {
		height: 100%;
		scroll-snap-align: start;
	}

	.daily-popup__media {
		display: block;
		width: 100%;
		height: 100%;
	}

	.daily-popup__img {
		display: block;
		width: 100%;
		height: 100%;
		object-fit: contain;
		background: var(--color-base-300);
	}

	.daily-popup__dots {
		position: absolute;
		bottom: 0.75rem;
		left: 50%;
		z-index: 4;
		display: flex;
		transform: translateX(-50%);
		gap: 0.4rem;
		padding: 0.35rem 0.55rem;
		border-radius: 9999px;
		background: color-mix(in oklab, var(--color-base-100) 72%, transparent);
		backdrop-filter: blur(6px);
	}

	.daily-popup__dot {
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 9999px;
		border: none;
		background: color-mix(in oklab, var(--color-base-content) 35%, transparent);
	}

	.daily-popup__dot--active {
		background: var(--color-primary);
		transform: scale(1.2);
	}
</style>
