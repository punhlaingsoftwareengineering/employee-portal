<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getContext } from 'svelte';

	type Variant = 'primary' | 'secondary' | 'error';
	type TooltipPlacement = 'tooltip-top' | 'tooltip-bottom' | 'tooltip-left' | 'tooltip-right';
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
	const effectiveTooltipPlacement = $derived(
		tooltipPlacement ?? tableActions?.tooltipPlacement ?? 'tooltip-left'
	);
	const effectiveVariant = $derived(LABEL_VARIANT[label] ?? variant);
	const isPrimary = $derived(effectiveVariant === 'primary');
	const isSecondary = $derived(effectiveVariant === 'secondary');
	const isError = $derived(effectiveVariant === 'error');
</script>

<div
	class="tooltip"
	class:tooltip-top={effectiveTooltipPlacement === 'tooltip-top'}
	class:tooltip-bottom={effectiveTooltipPlacement === 'tooltip-bottom'}
	class:tooltip-left={effectiveTooltipPlacement === 'tooltip-left'}
	class:tooltip-right={effectiveTooltipPlacement === 'tooltip-right'}
	class:tooltip-primary={isPrimary}
	class:tooltip-secondary={isSecondary}
	class:tooltip-error={isError}
	data-tip={label}
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
</div>
