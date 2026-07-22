<script lang="ts">
	import { onMount } from 'svelte';
	import { BadgeQuestionMark, Bot, Palette, Type } from '@lucide/svelte';
	import AiChatDialog from '$lib/components/AiChatDialog.svelte';
	import FontDialog from '$lib/components/FontDialog.svelte';
	import ThemeDialog from '$lib/components/ThemeDialog.svelte';
	import { getAllowedFontOptions, getAllowedThemeOptions } from '$lib/app-settings.svelte';

	let { canUseAiChat = false }: { canUseAiChat?: boolean } = $props();

	let chatDialog = $state<AiChatDialog | null>(null);
	let themeDialog = $state<ThemeDialog | null>(null);
	let fontDialog = $state<FontDialog | null>(null);

	const themeOptions = $derived(getAllowedThemeOptions());
	const fontOptions = $derived(getAllowedFontOptions());
	const showThemeControl = $derived(themeOptions.length > 1);
	const showFontControl = $derived(fontOptions.length > 1);

	function closeFab() {
		if (document.activeElement instanceof HTMLElement) {
			document.activeElement.blur();
		}
	}

	function openChat() {
		if (!canUseAiChat) return;
		closeFab();
		chatDialog?.open();
	}

	function openTheme() {
		closeFab();
		themeDialog?.open();
	}

	function openFont() {
		closeFab();
		fontDialog?.open();
	}

	onMount(() => {
		function onKeydown(event: KeyboardEvent) {
			if (!canUseAiChat) return;
			if (!event.ctrlKey || event.metaKey || event.altKey) return;
			if (event.key !== '/' && event.code !== 'Slash') return;

			const target = event.target;
			if (
				target instanceof HTMLElement &&
				(target.isContentEditable ||
					target.closest('input, textarea, select, [contenteditable="true"]') !== null)
			)
				return;

			event.preventDefault();
			if (document.activeElement instanceof HTMLElement) {
				document.activeElement.blur();
			}
			chatDialog?.open();
		}

		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});
</script>

{#if canUseAiChat}
	<AiChatDialog bind:this={chatDialog} />
{/if}
<ThemeDialog bind:this={themeDialog} />
<FontDialog bind:this={fontDialog} />

<div class="fab z-50">
	<div tabindex="0" role="button" class="btn btn-circle btn-primary shadow-lg" aria-label="Help">
		<BadgeQuestionMark class="h-4 w-4" />
	</div>

	{#if canUseAiChat}
		<div class="tooltip tooltip-left" data-tip="AI assistant (Ctrl+/)">
			<button
				type="button"
				class="btn btn-circle btn-primary shadow-md"
				aria-label="AI assistant (Ctrl+/)"
				onclick={openChat}
			>
				<Bot class="h-4 w-4" />
			</button>
		</div>
	{/if}

	{#if showFontControl}
		<div class="tooltip tooltip-left" data-tip="Font">
			<button
				type="button"
				class="btn btn-circle btn-warning shadow-md"
				aria-label="Font"
				onclick={openFont}
			>
				<Type class="h-4 w-4" />
			</button>
		</div>
	{/if}

	{#if showThemeControl}
		<div class="tooltip tooltip-left" data-tip="Theme">
			<button
				type="button"
				class="btn btn-circle btn-info shadow-md"
				aria-label="Theme"
				onclick={openTheme}
			>
				<Palette class="h-4 w-4" />
			</button>
		</div>
	{/if}
</div>
