<script lang="ts">
	import { browser } from '$app/env';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { Megaphone, X } from '@lucide/svelte';
	import { IMAGE_ASPECT } from '$lib/constants/image-aspect';
	import {
		WELCOME_NOTICE_AUTO_OPEN,
		WELCOME_NOTICE_DISMISSED_KEY,
		WELCOME_NOTICE_FORCE_QUERY,
		WELCOME_NOTICE_MOCK
	} from '$lib/constants/welcome-notice';

	let dialog = $state<HTMLDialogElement | null>(null);

	const notice = WELCOME_NOTICE_MOCK;
	/** 4:5 poster — same family as newsletter covers; best for notice cards. */
	const posterAspect = IMAGE_ASPECT.notice;

	function isDismissed(): boolean {
		if (!browser) return true;
		return localStorage.getItem(WELCOME_NOTICE_DISMISSED_KEY) === '1';
	}

	function shouldForceOpen(): boolean {
		return page.url.searchParams.get(WELCOME_NOTICE_FORCE_QUERY) === '1';
	}

	export function open() {
		dialog?.showModal();
	}

	function dismiss() {
		if (browser) {
			localStorage.setItem(WELCOME_NOTICE_DISMISSED_KEY, '1');
		}
		dialog?.close();
	}

	function onBackdropClose() {
		if (browser) {
			localStorage.setItem(WELCOME_NOTICE_DISMISSED_KEY, '1');
		}
	}

	onMount(() => {
		if (shouldForceOpen() || (WELCOME_NOTICE_AUTO_OPEN && !isDismissed())) {
			// Defer so the home shell paints first, then the notice appears.
			requestAnimationFrame(() => open());
		}
	});
</script>

<dialog
	bind:this={dialog}
	class="modal modal-middle"
	aria-labelledby="welcome-notice-title"
	aria-describedby="welcome-notice-body"
	onclose={onBackdropClose}
>
	<div
		class="welcome-notice modal-box p-0"
		style:aspect-ratio="{posterAspect.width} / {posterAspect.height}"
	>
		<button
			type="button"
			class="btn btn-ghost btn-sm btn-circle welcome-notice__close"
			aria-label="Close notice"
			onclick={dismiss}
		>
			<X class="h-4 w-4" strokeWidth={2.25} />
		</button>

		<div class="welcome-notice__stage" aria-hidden="true">
			<div class="welcome-notice__glow"></div>
			<div class="welcome-notice__grid"></div>
			<div class="welcome-notice__orb welcome-notice__orb--a"></div>
			<div class="welcome-notice__orb welcome-notice__orb--b"></div>
		</div>

		<div class="welcome-notice__content">
			<span class="welcome-notice__badge">
				<Megaphone class="h-3.5 w-3.5" />
				{notice.eyebrow}
			</span>

			<div class="welcome-notice__copy-block">
				<h2 id="welcome-notice-title" class="welcome-notice__heading">{notice.title}</h2>
				<p id="welcome-notice-body" class="welcome-notice__copy">{notice.body}</p>
			</div>

			<div class="welcome-notice__actions">
				<button type="button" class="btn btn-primary btn-sm" onclick={dismiss}>
					{notice.ctaLabel}
				</button>
				{#if notice.secondaryHref && notice.secondaryLabel}
					<a href={notice.secondaryHref} class="btn btn-ghost btn-sm" onclick={dismiss}>
						{notice.secondaryLabel}
					</a>
				{/if}
			</div>
		</div>
	</div>

	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close notice">close</button>
	</form>
</dialog>

<style>
	.welcome-notice {
		/* ~22rem wide × 4:5 → compact square-ish notice poster */
		position: relative;
		display: flex;
		width: min(22rem, calc(100vw - 2rem));
		max-width: min(22rem, calc(100vw - 2rem));
		max-height: min(calc(22rem * 5 / 4), calc(100vh - 5rem));
		flex-direction: column;
		justify-content: flex-end;
		overflow: hidden;
		border: 1px solid color-mix(in oklab, var(--color-base-content) 10%, transparent);
		background: var(--color-base-200);
		box-shadow:
			0 1px 2px color-mix(in oklab, var(--color-base-content) 6%, transparent),
			0 24px 48px -16px color-mix(in oklab, var(--color-base-content) 28%, transparent);
		animation: welcome-notice-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.welcome-notice__close {
		position: absolute;
		top: 0.625rem;
		right: 0.625rem;
		z-index: 3;
		background: color-mix(in oklab, var(--color-base-100) 82%, transparent);
		backdrop-filter: blur(6px);
		border: 1px solid color-mix(in oklab, var(--color-base-content) 8%, transparent);
	}

	.welcome-notice__close:hover {
		background: var(--color-base-100);
	}

	.welcome-notice__stage {
		pointer-events: none;
		position: absolute;
		inset: 0;
		background:
			radial-gradient(
				120% 90% at 12% 0%,
				color-mix(in oklab, var(--color-primary) 42%, transparent),
				transparent 55%
			),
			radial-gradient(
				90% 70% at 100% 100%,
				color-mix(in oklab, var(--color-secondary) 28%, transparent),
				transparent 50%
			),
			linear-gradient(
				165deg,
				color-mix(in oklab, var(--color-primary) 16%, var(--color-base-200)),
				var(--color-base-300)
			);
	}

	.welcome-notice__glow {
		position: absolute;
		inset: -15% 15% auto;
		height: 45%;
		background: radial-gradient(
			circle,
			color-mix(in oklab, var(--color-primary) 38%, transparent),
			transparent 70%
		);
		filter: blur(14px);
		animation: welcome-notice-glow 4.5s ease-in-out infinite alternate;
	}

	.welcome-notice__grid {
		position: absolute;
		inset: 0;
		opacity: 0.2;
		background-image:
			linear-gradient(
				color-mix(in oklab, var(--color-base-content) 12%, transparent) 1px,
				transparent 1px
			),
			linear-gradient(
				90deg,
				color-mix(in oklab, var(--color-base-content) 12%, transparent) 1px,
				transparent 1px
			);
		background-size: 1.25rem 1.25rem;
		mask-image: linear-gradient(to bottom, black 25%, transparent 85%);
	}

	.welcome-notice__orb {
		position: absolute;
		border-radius: 9999px;
		border: 1px solid color-mix(in oklab, var(--color-base-content) 12%, transparent);
		background: color-mix(in oklab, var(--color-base-100) 28%, transparent);
		backdrop-filter: blur(2px);
	}

	.welcome-notice__orb--a {
		top: 18%;
		left: 12%;
		width: 4.5rem;
		height: 4.5rem;
		animation: welcome-notice-float 5.5s ease-in-out infinite;
	}

	.welcome-notice__orb--b {
		top: 28%;
		right: 14%;
		width: 2.75rem;
		height: 2.75rem;
		animation: welcome-notice-float 4.2s ease-in-out infinite reverse;
	}

	.welcome-notice__content {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
		padding: 1.25rem;
		background: linear-gradient(
			to top,
			color-mix(in oklab, var(--color-base-100) 96%, transparent) 55%,
			color-mix(in oklab, var(--color-base-100) 78%, transparent) 78%,
			transparent
		);
	}

	.welcome-notice__badge {
		display: inline-flex;
		width: fit-content;
		align-items: center;
		gap: 0.375rem;
		border-radius: 9999px;
		border: 1px solid color-mix(in oklab, var(--color-base-content) 12%, transparent);
		background: color-mix(in oklab, var(--color-base-100) 78%, transparent);
		padding: 0.25rem 0.625rem;
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--color-base-content);
		backdrop-filter: blur(6px);
	}

	.welcome-notice__copy-block {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.welcome-notice__heading {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.25;
		letter-spacing: -0.02em;
		text-wrap: balance;
	}

	.welcome-notice__copy {
		font-size: 0.875rem;
		line-height: 1.55;
		color: color-mix(in oklab, var(--color-base-content) 72%, transparent);
		text-wrap: pretty;
	}

	.welcome-notice__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	@keyframes welcome-notice-in {
		from {
			opacity: 0;
			transform: translateY(0.75rem) scale(0.97);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
		}
	}

	@keyframes welcome-notice-glow {
		from {
			opacity: 0.55;
			transform: translateY(0);
		}
		to {
			opacity: 1;
			transform: translateY(0.5rem);
		}
	}

	@keyframes welcome-notice-float {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-0.4rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.welcome-notice,
		.welcome-notice__glow,
		.welcome-notice__orb--a,
		.welcome-notice__orb--b {
			animation: none;
		}
	}
</style>
