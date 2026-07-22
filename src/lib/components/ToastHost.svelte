<script lang="ts">
	import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from '@lucide/svelte';
	import { dismissToast, toasts, type ToastType } from '$lib/toast.svelte';

	const iconByType: Record<ToastType, typeof CheckCircle2> = {
		success: CheckCircle2,
		error: CircleAlert,
		warning: TriangleAlert,
		info: Info
	};

	const alertClassByType: Record<ToastType, string> = {
		success: 'alert-success',
		error: 'alert-error',
		warning: 'alert-warning',
		info: 'alert-info'
	};
</script>

{#if toasts.length > 0}
	<div class="toast toast-end toast-bottom z-[9999]">
		{#each toasts as item (item.id)}
			{@const Icon = iconByType[item.type]}
			<div class="alert {alertClassByType[item.type]} shadow-lg" role="status">
				<Icon class="h-5 w-5 shrink-0" />
				<span>{item.message}</span>
				<button
					type="button"
					class="btn btn-ghost btn-xs btn-circle"
					aria-label="Dismiss"
					onclick={() => dismissToast(item.id)}
				>
					<X class="h-4 w-4" />
				</button>
			</div>
		{/each}
	</div>
{/if}
