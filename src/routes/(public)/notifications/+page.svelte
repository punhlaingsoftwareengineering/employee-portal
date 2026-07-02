<script lang="ts">
	import { page } from '$app/state';
	import type { PublicNotification } from '$lib/schemas/notification';
	import NotificationListItem from '$lib/components/NotificationListItem.svelte';
	import {
		dismissAllNotificationsLocally,
		dismissNotificationLocally,
		loadDismissedNotificationIds
	} from '$lib/notification-client';
	import {
		dismissAllNotifications,
		dismissNotification
	} from '$lib/remotes/notification.remote';
	import PageTitle from '$lib/components/PageTitle.svelte';

	let { data } = $props();

	let notifications = $state<PublicNotification[]>([...data.notifications]);
	let guestDismissed = $state(loadDismissedNotificationIds());

	const userId = $derived(data.user?.id ?? page.data.user?.id ?? null);

	const visibleNotifications = $derived.by(() => {
		if (userId) return notifications;
		return notifications.filter((item) => !guestDismissed.has(item.id));
	});

	async function handleDismiss(id: string) {
		if (userId) {
			await dismissNotification(id);
			notifications = notifications.filter((item) => item.id !== id);
			return;
		}

		dismissNotificationLocally(id);
		guestDismissed = loadDismissedNotificationIds();
		notifications = notifications.filter((item) => item.id !== id);
	}

	async function handleDismissAll() {
		const ids = visibleNotifications.map((item) => item.id);
		if (ids.length === 0) return;

		if (userId) {
			await dismissAllNotifications(ids);
			notifications = notifications.filter((item) => !ids.includes(item.id));
			return;
		}

		dismissAllNotificationsLocally(ids);
		guestDismissed = loadDismissedNotificationIds();
		notifications = notifications.filter((item) => !ids.includes(item.id));
	}
</script>

<PageTitle title="Notifications" />

<div class="container mx-auto max-w-3xl px-4 py-8">
	<div class="mb-6 flex items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold">Notifications</h1>
			<p class="text-sm text-base-content/70">All current portal notifications.</p>
		</div>
		<button
			type="button"
			class="btn btn-outline btn-sm"
			disabled={visibleNotifications.length === 0}
			onclick={handleDismissAll}
		>
			Mark all as read
		</button>
	</div>

	<div class="card bg-base-100 shadow-sm">
		<div class="card-body p-0">
			{#if visibleNotifications.length === 0}
				<p class="px-4 py-8 text-sm text-base-content/60">No notifications right now.</p>
			{:else}
				<div class="divide-y divide-base-200">
					{#each visibleNotifications as notification (notification.id)}
						<NotificationListItem {notification} onDismiss={handleDismiss} />
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
