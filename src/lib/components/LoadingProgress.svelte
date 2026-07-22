<script lang="ts">
	import { loadingProgress } from '$lib/form-feedback.svelte';

	let {
		label,
		percent,
		color = 'primary',
		class: className = ''
	}: {
		label?: string;
		percent?: number;
		color?: 'primary' | 'secondary' | 'accent' | 'info' | 'success' | 'warning' | 'error' | 'neutral';
		class?: string;
	} = $props();

	const shownLabel = $derived(label ?? loadingProgress.label);
	const shownPercent = $derived(percent ?? loadingProgress.percent);
	const colorClass = $derived(`progress-${color}`);
</script>

<div class="flex w-full flex-col gap-2 {className}">
	{#if shownLabel}
		<div class="flex items-center justify-between gap-2 text-sm">
			<span class="text-base-content/80">{shownLabel}</span>
			<span class="tabular-nums text-base-content/60">{shownPercent}%</span>
		</div>
	{/if}
	<progress class="progress {colorClass} w-full" value={shownPercent} max="100"></progress>
</div>
