<script lang="ts">
	import { loadingProgress } from '$lib/form-feedback.svelte';
	import LoadingProgress from '$lib/components/LoadingProgress.svelte';
</script>

{#if loadingProgress.active}
	<dialog class="modal modal-open" aria-live="polite" aria-busy="true">
		<div class="modal-box max-w-sm">
			<div class="flex items-center gap-3">
				<span class="loading loading-spinner loading-md text-primary" aria-hidden="true"></span>
				<div class="min-w-0 flex-1">
					<h3 class="font-semibold">Please wait</h3>
					<LoadingProgress class="mt-3" />
				</div>
			</div>
		</div>
		<div class="modal-backdrop bg-base-300/60"></div>
	</dialog>
{/if}
