<script lang="ts">
	import { BadgeQuestionMark, Bot, Palette, Ticket, Type } from '@lucide/svelte';
	import AiChatDialog from '$lib/components/AiChatDialog.svelte';
	import FontDialog from '$lib/components/FontDialog.svelte';
	import SupportTicketDialog from '$lib/components/SupportTicketDialog.svelte';
	import ThemeDialog from '$lib/components/ThemeDialog.svelte';
	import { getAllowedFontOptions, getAllowedThemeOptions } from '$lib/app-settings.svelte';
	import type { User } from 'better-auth';

	let { user = null }: { user?: User | null } = $props();

	let ticketDialog = $state<SupportTicketDialog | null>(null);
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

	function openTicket() {
		closeFab();
		ticketDialog?.open();
	}

	function openChat() {
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

	function isEditableTarget(target: EventTarget | null): boolean {
		return (
			target instanceof HTMLElement &&
			(target.isContentEditable ||
				target.closest('input, textarea, select, [contenteditable="true"]') !== null)
		);
	}

	$effect(() => {
		function onKeydown(event: KeyboardEvent) {
			if (!event.ctrlKey || event.metaKey || event.altKey) return;
			if (event.key !== '/' && event.code !== 'Slash') return;
			if (isEditableTarget(event.target)) return;

			event.preventDefault();
			openChat();
		}

		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});
</script>

<SupportTicketDialog bind:this={ticketDialog} {user} />
<AiChatDialog bind:this={chatDialog} />
<ThemeDialog bind:this={themeDialog} />
<FontDialog bind:this={fontDialog} />

<div class="fab z-50">
	<div tabindex="0" role="button" class="btn btn-sm btn-circle btn-primary shadow-lg" aria-label="Help">
		<BadgeQuestionMark class="h-4 w-4" />
	</div>

	<div class="text-sm font-medium">
		Submit ticket
		<button
			type="button"
			class="btn btn-sm btn-circle btn-secondary shadow-md"
			aria-label="Submit ticket"
			onclick={openTicket}
		>
			<Ticket class="h-4 w-4" />
		</button>
	</div>

	<div class="flex items-center gap-1 text-sm font-medium">
		<span>AI assistant</span>
		<kbd class="kbd kbd-xs opacity-70">Ctrl</kbd><kbd class="kbd kbd-xs opacity-70">/</kbd>
		<button
			type="button"
			class="btn btn-sm btn-circle btn-accent shadow-md"
			aria-label="AI assistant (Ctrl+/)"
			onclick={openChat}
		>
			<Bot class="h-4 w-4" />
		</button>
	</div>

	{#if showFontControl}
		<div class="text-sm font-medium">
			Font
			<button
				type="button"
				class="btn btn-sm btn-circle btn-warning shadow-md"
				aria-label="Font"
				onclick={openFont}
			>
				<Type class="h-4 w-4" />
			</button>
		</div>
	{/if}

	{#if showThemeControl}
		<div class="text-sm font-medium">
			Theme
			<button
				type="button"
				class="btn btn-sm btn-circle btn-info shadow-md"
				aria-label="Theme"
				onclick={openTheme}
			>
				<Palette class="h-4 w-4" />
			</button>
		</div>
	{/if}
</div>
