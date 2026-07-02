<script lang="ts">
	import type { PublicNotification } from '$lib/schemas/notification';
	import NotificationIcon from '$lib/components/NotificationIcon.svelte';
	import { X } from '@lucide/svelte';

	let {
		notification,
		onDismiss
	}: {
		notification: PublicNotification;
		onDismiss: (id: string) => void | Promise<void>;
	} = $props();

	const priorityClass = $derived(
		({
			info: 'border-info',
			success: 'border-success',
			warning: 'border-warning',
			error: 'border-error'
		})[notification.priority]
	);
</script>

<div class="flex items-start gap-2 border-l-4 px-3 py-2 {priorityClass}">
	{#if notification.linkUrl}
		<a
			href={notification.linkUrl}
			class="flex min-w-0 flex-1 items-start gap-3 hover:opacity-80"
			target="_blank"
			rel="noopener noreferrer"
		>
			<NotificationIcon {notification} />
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold">{notification.title}</p>
				{#if notification.body}
					<p class="mt-0.5 line-clamp-2 text-xs text-base-content/70">{notification.body}</p>
				{/if}
			</div>
		</a>
	{:else}
		<div class="flex min-w-0 flex-1 items-start gap-3">
			<NotificationIcon {notification} />
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-semibold">{notification.title}</p>
				{#if notification.body}
					<p class="mt-0.5 line-clamp-2 text-xs text-base-content/70">{notification.body}</p>
				{/if}
			</div>
		</div>
	{/if}
	<button
		type="button"
		class="btn btn-ghost btn-xs btn-square shrink-0"
		aria-label="Dismiss notification"
		onclick={() => onDismiss(notification.id)}
	>
		<X class="h-3.5 w-3.5" />
	</button>
</div>
