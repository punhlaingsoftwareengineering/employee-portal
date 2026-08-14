<script lang="ts">
	import { page } from '$app/state';
	import type { PublicNotification } from '$lib/schemas/notification';
	import NotificationListItem from '$lib/components/NotificationListItem.svelte';
	import {
		dismissAllNotifications,
		dismissNotification
	} from '$lib/remotes/notification.remote';
	import PageTitle from '$lib/components/PageTitle.svelte';

	let { data } = $props();

	let notifications = $state<PublicNotification[]>(
		data.notifications.map((item) => ({ ...item, isRead: item.isRead ?? false }))
	);

	const userId = $derived(data.user?.id ?? page.data.user?.id ?? null);
	const unreadCount = $derived(notifications.filter((item) => !item.isRead).length);

	async function handleMarkRead(id: string) {
		if (!userId) return;
		await dismissNotification(id);
		notifications = notifications.map((item) =>
			item.id === id ? { ...item, isRead: true } : item
		);
	}

	async function handleMarkAllRead() {
		if (!userId) return;
		const ids = notifications.filter((item) => !item.isRead).map((item) => item.id);
		if (ids.length === 0) return;
		await dismissAllNotifications(ids);
		notifications = notifications.map((item) => ({ ...item, isRead: true }));
	}
</script>

<PageTitle title="Notifications" />

<div class="container mx-auto max-w-3xl px-4 py-4">
	<div class="mb-4 flex items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold">Notifications</h1>
			<p class="text-sm text-base-content/70">
				Portal notification history. Marking as read clears the badge but keeps items here.
			</p>
		</div>
		{#if unreadCount > 0}
			<button type="button" class="btn btn-ghost btn-sm" onclick={handleMarkAllRead}>
				Mark all as read
			</button>
		{/if}
	</div>

	<div class="rounded-box border border-base-300 bg-base-100">
		{#if notifications.length === 0}
			<p class="px-4 py-8 text-sm text-base-content/60">No notifications right now.</p>
		{:else}
			<div class="divide-y divide-base-200">
				{#each notifications as notification (notification.id)}
					<NotificationListItem {notification} onMarkRead={handleMarkRead} />
				{/each}
			</div>
		{/if}
	</div>
</div>
