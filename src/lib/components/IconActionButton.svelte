<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'error';
	type TooltipSide = 'top' | 'bottom' | 'left' | 'right';
	type TooltipPlacement = `tooltip-${TooltipSide}` | 'auto';
	type ButtonSize = 'sm' | 'xs';

	const LABEL_VARIANT: Partial<Record<string, Variant>> = {
		View: 'primary',
		Open: 'primary',
		Edit: 'secondary',
		Resend: 'secondary',
		Delete: 'error',
		Revoke: 'error',
		Remove: 'error'
	};

	let {
		label,
		variant = 'primary',
		href,
		external = false,
		onclick,
		disabled = false,
		type = 'button',
		size,
		tooltipPlacement,
		children
	}: {
		label: string;
		variant?: Variant;
		href?: string;
		external?: boolean;
		onclick?: (event: MouseEvent) => void;
		disabled?: boolean;
		type?: 'button' | 'submit';
		size?: ButtonSize;
		tooltipPlacement?: TooltipPlacement;
		children?: Snippet;
	} = $props();

	const tableActions = getContext<
		{ size?: ButtonSize; tooltipPlacement?: TooltipPlacement } | undefined
	>('data-table-actions');

	const effectiveSize = $derived(size ?? tableActions?.size ?? 'sm');
	const configuredPlacement = $derived(
		tooltipPlacement ?? tableActions?.tooltipPlacement ?? 'auto'
	);
	const effectiveVariant = $derived(LABEL_VARIANT[label] ?? variant);
	const isPrimary = $derived(effectiveVariant === 'primary');
	const isSecondary = $derived(effectiveVariant === 'secondary');
	const isError = $derived(effectiveVariant === 'error');

	let anchorEl = $state<HTMLElement | null>(null);
	let showTooltip = $state(false);
	let tooltipSide = $state<TooltipSide>('top');
	let tooltipX = $state(0);
	let tooltipY = $state(0);

	function placementToSide(placement: TooltipPlacement): TooltipSide | 'auto' {
		if (placement === 'auto') return 'auto';
		return placement.replace('tooltip-', '') as TooltipSide;
	}

	function pickSide(rect: DOMRect): TooltipSide {
		const gap = 8;
		const estimated = 56;
		const spaces: Record<TooltipSide, number> = {
			top: rect.top - gap,
			bottom: window.innerHeight - rect.bottom - gap,
			left: rect.left - gap,
			right: window.innerWidth - rect.right - gap
		};
		const order: TooltipSide[] = ['top', 'bottom', 'right', 'left'];
		const viable = order.filter((side) => spaces[side] >= estimated);
		const pool = viable.length > 0 ? viable : order;
		return pool.reduce(
			(best, side) => (spaces[side] > spaces[best] ? side : best),
			pool[0]
		);
	}

	function updateTooltipPosition() {
		if (!anchorEl) return;
		const rect = anchorEl.getBoundingClientRect();
		const preferred = placementToSide(configuredPlacement);
		tooltipSide = preferred === 'auto' ? pickSide(rect) : preferred;

		const gap = 8;
		switch (tooltipSide) {
			case 'top':
				tooltipX = rect.left + rect.width / 2;
				tooltipY = rect.top - gap;
				break;
			case 'bottom':
				tooltipX = rect.left + rect.width / 2;
				tooltipY = rect.bottom + gap;
				break;
			case 'left':
				tooltipX = rect.left - gap;
				tooltipY = rect.top + rect.height / 2;
				break;
			case 'right':
				tooltipX = rect.right + gap;
				tooltipY = rect.top + rect.height / 2;
				break;
		}
	}

	function openTooltip() {
		if (disabled) return;
		updateTooltipPosition();
		showTooltip = true;
	}

	function closeTooltip() {
		showTooltip = false;
	}

	onMount(() => {
		function hideOnScroll() {
			if (showTooltip) closeTooltip();
		}
		window.addEventListener('scroll', hideOnScroll, true);
		window.addEventListener('resize', hideOnScroll);
		return () => {
			window.removeEventListener('scroll', hideOnScroll, true);
			window.removeEventListener('resize', hideOnScroll);
		};
	});
</script>

<span
	class="inline-flex"
	role="group"
	bind:this={anchorEl}
	onpointerenter={openTooltip}
	onpointerleave={closeTooltip}
	onfocusin={openTooltip}
	onfocusout={closeTooltip}
>
	{#if href}
		<a
			{href}
			class="btn btn-square"
			class:btn-sm={effectiveSize === 'sm'}
			class:btn-xs={effectiveSize === 'xs'}
			class:btn-primary={isPrimary}
			class:btn-secondary={isSecondary}
			class:btn-error={isError}
			aria-label={label}
			target={external ? '_blank' : undefined}
			rel={external ? 'noopener noreferrer' : undefined}
		>
			{@render children?.()}
		</a>
	{:else}
		<button
			{type}
			class="btn btn-square"
			class:btn-sm={effectiveSize === 'sm'}
			class:btn-xs={effectiveSize === 'xs'}
			class:btn-primary={isPrimary}
			class:btn-secondary={isSecondary}
			class:btn-error={isError}
			aria-label={label}
			{onclick}
			{disabled}
		>
			{@render children?.()}
		</button>
	{/if}
</span>

{#if showTooltip}
	<span
		role="tooltip"
		class="icon-action-floating-tip"
		class:icon-action-floating-tip-top={tooltipSide === 'top'}
		class:icon-action-floating-tip-bottom={tooltipSide === 'bottom'}
		class:icon-action-floating-tip-left={tooltipSide === 'left'}
		class:icon-action-floating-tip-right={tooltipSide === 'right'}
		class:icon-action-floating-tip-primary={isPrimary}
		class:icon-action-floating-tip-secondary={isSecondary}
		class:icon-action-floating-tip-error={isError}
		style:left="{tooltipX}px"
		style:top="{tooltipY}px"
	>
		{label}
	</span>
{/if}
