<script lang="ts">
	import { Type } from '@lucide/svelte';
	import {
		appSettings,
		getAllowedFontOptions,
		updateAppSettings
	} from '$lib/app-settings.svelte';
	import type { AppFont } from '$lib/constants/app-settings';
	import { getPortalFontStack } from '$lib/constants/portal-fonts';

	let dialog = $state<HTMLDialogElement | null>(null);

	const fontOptions = $derived(getAllowedFontOptions());

	export function open() {
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
	}

	function setFont(font: AppFont) {
		updateAppSettings({ font });
		close();
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box w-full max-w-2xl">
		<h3 class="flex items-center gap-2 text-lg font-bold">
			<Type class="h-5 w-5 text-primary" />
			Font
		</h3>
		<p class="mt-1 text-sm text-base-content/70">Choose a font for this device.</p>

		<div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
			{#each fontOptions as option (option.value)}
				<button
					type="button"
					class="font-picker-option"
					class:font-picker-option--active={appSettings.font === option.value}
					style:font-family={getPortalFontStack(option.value)}
					onclick={() => setFont(option.value)}
				>
					<span class="font-picker-option__label">{option.label}</span>
					<span class="font-picker-option__sample">The quick brown fox jumps over the lazy dog.</span>
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
	.font-picker-option {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		overflow: hidden;
		border-radius: var(--radius-box, 0.5rem);
		border: 2px solid color-mix(in oklab, var(--color-base-content) 15%, transparent);
		background: var(--color-base-100);
		padding: 0.75rem;
		text-align: left;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.15s ease;
	}

	.font-picker-option:hover {
		border-color: color-mix(in oklab, var(--color-primary) 45%, transparent);
		transform: translateY(-1px);
	}

	.font-picker-option--active {
		border-color: var(--color-primary);
		box-shadow: 0 0 0 2px color-mix(in oklab, var(--color-primary) 25%, transparent);
	}

	.font-picker-option__label {
		font-size: 0.875rem;
		font-weight: 600;
		line-height: 1.25;
	}

	.font-picker-option__sample {
		font-size: 0.8125rem;
		line-height: 1.4;
		opacity: 0.8;
	}
</style>
