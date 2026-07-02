<script lang="ts">
	import { browser } from '$app/env';
	import { Palette } from '@lucide/svelte';
	import {
		appSettings,
		getAllowedThemeOptions,
		updateAppSettings
	} from '$lib/app-settings.svelte';
	import type { AppTheme } from '$lib/constants/app-settings';
	import {
		SYSTEM_DARK_THEME,
		SYSTEM_LIGHT_THEME,
		SYSTEM_THEME_OPTION,
		resolveSystemTheme
	} from '$lib/constants/daisyui-themes';

	let dialog = $state<HTMLDialogElement | null>(null);

	const themeOptions = $derived(getAllowedThemeOptions());
	const stripeColors = ['bg-primary', 'bg-secondary', 'bg-accent', 'bg-neutral', 'bg-info'] as const;

	export function open() {
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
	}

	function setTheme(theme: AppTheme) {
		updateAppSettings({ theme });
		close();
	}

	function previewTheme(value: AppTheme): string {
		if (value === SYSTEM_THEME_OPTION) {
			if (!browser) return SYSTEM_LIGHT_THEME;
			return resolveSystemTheme(window.matchMedia('(prefers-color-scheme: dark)').matches);
		}
		return value;
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box w-full max-w-4xl">
		<h3 class="flex items-center gap-2 text-lg font-bold">
			<Palette class="h-5 w-5 text-primary" />
			Theme
		</h3>
		<p class="mt-1 text-sm text-base-content/70">Choose a color theme for this device.</p>

		<div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
			{#each themeOptions as option (option.value)}
				<button
					type="button"
					class="theme-picker-option"
					class:theme-picker-option--active={appSettings.theme === option.value}
					onclick={() => setTheme(option.value)}
				>
					{#if option.value === SYSTEM_THEME_OPTION}
						<div class="theme-picker-stripe theme-picker-stripe--system" aria-hidden="true">
							<div data-theme={SYSTEM_LIGHT_THEME} class="theme-picker-stripe__half">
								{#each stripeColors as colorClass (colorClass)}
									<span class={colorClass}></span>
								{/each}
							</div>
							<div data-theme={SYSTEM_DARK_THEME} class="theme-picker-stripe__half">
								{#each stripeColors as colorClass (colorClass)}
									<span class={colorClass}></span>
								{/each}
							</div>
						</div>
					{:else}
						<div data-theme={option.value} class="theme-picker-stripe" aria-hidden="true">
							{#each stripeColors as colorClass (colorClass)}
								<span class={colorClass}></span>
							{/each}
						</div>
					{/if}

					<span data-theme={previewTheme(option.value)} class="theme-picker-option__label">
						{option.label}
					</span>
				</button>
			{/each}
		</div>

		<div class="modal-action">
			<button type="button" class="btn btn-ghost btn-sm" onclick={close}>Close</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>

<style>
	.theme-picker-option {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		border-radius: var(--radius-box, 0.5rem);
		border: 2px solid color-mix(in oklab, var(--color-base-content) 15%, transparent);
		background: transparent;
		padding: 0;
		text-align: center;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.15s ease;
	}

	.theme-picker-option:hover {
		border-color: color-mix(in oklab, var(--color-primary) 45%, transparent);
		transform: translateY(-1px);
	}

	.theme-picker-option--active {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary) 25%, transparent);
	}

	.theme-picker-stripe {
		display: flex;
		height: 0.625rem;
		width: 100%;
	}

	.theme-picker-stripe > span,
	.theme-picker-stripe__half > span {
		flex: 1;
		min-width: 0;
	}

	.theme-picker-stripe--system {
		display: flex;
	}

	.theme-picker-stripe__half {
		display: flex;
		flex: 1;
		min-width: 0;
	}

	.theme-picker-option__label {
		display: block;
		background: var(--color-base-100);
		color: var(--color-base-content);
		padding: 0.625rem 0.5rem;
		font-size: 0.8125rem;
		font-weight: 600;
		line-height: 1.25;
	}
</style>
