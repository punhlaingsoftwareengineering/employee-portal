<script lang="ts">
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { ONBOARDING_CAROUSEL_INTERVAL_OPTIONS_MS } from '$lib/constants/onboarding-carousel';
	import { updateOnboardingCarouselConfig } from '$lib/remotes/onboarding-carousel-config.remote';

	let { initialIntervalMs }: { initialIntervalMs: number } = $props();

	let intervalMs = $state(initialIntervalMs);
	let saving = $state(false);
	let error = $state<string | null>(null);
	let saved = $state(false);

	async function save() {
		saving = true;
		error = null;
		saved = false;
		try {
			const config = await updateOnboardingCarouselConfig({ intervalMs });
			intervalMs = config.intervalMs;
			saved = true;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save carousel speed';
		} finally {
			saving = false;
		}
	}
</script>

<div class="flex flex-wrap items-end gap-3">
	<label class="form-control w-full max-w-xs">
		<span class="label py-0">
			<span class="label-text">Interval</span>
		</span>
		<select
			class="select select-bordered w-full"
			value={String(intervalMs)}
			onchange={(event) => {
				intervalMs = Number(event.currentTarget.value);
				saved = false;
			}}
		>
			{#each ONBOARDING_CAROUSEL_INTERVAL_OPTIONS_MS as ms (ms)}
				<option value={String(ms)}>{ms / 1000}s</option>
			{/each}
		</select>
	</label>
	<button type="button" class="btn btn-primary btn-sm" disabled={saving} onclick={() => void save()}>
		{#if saving}
			<LoadingSpinner size="sm" />
		{:else}
			Save
		{/if}
	</button>
</div>
{#if saved}
	<p class="mt-2 text-sm text-success">Saved. Public onboarding will use the new speed.</p>
{/if}
{#if error}
	<p class="mt-2 text-sm text-error">{error}</p>
{/if}
