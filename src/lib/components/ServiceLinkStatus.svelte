<script lang="ts">
	let {
		status = 'checking'
	}: {
		status?: 'checking' | 'up' | 'down';
	} = $props();

	const ariaLabel = $derived(
		status === 'up'
			? 'Service online'
			: status === 'down'
				? 'Service unavailable'
				: 'Checking service'
	);
</script>

{#if status === 'down'}
	<div class="inline-grid shrink-0 *:[grid-area:1/1]" aria-label={ariaLabel}>
		<div class="status status-error status-sm animate-ping"></div>
		<div class="status status-error status-sm"></div>
	</div>
{:else if status === 'up'}
	<div class="status status-success status-sm shrink-0" aria-label={ariaLabel}></div>
{:else}
	<div class="status status-neutral status-sm shrink-0" aria-label={ariaLabel}></div>
{/if}
