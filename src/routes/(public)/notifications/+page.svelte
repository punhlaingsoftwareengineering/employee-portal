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

	let notifications = $state<PublicNotification[]>([...data.notifications]);

	const userId = $derived(data.user?.id ?? page.data.user?.id ?? null);

	async function handleDismiss(id: string) {
		if (!userId) return;
		await dismissNotification(id);
		notifications = notifications.filter((item) => item.id !== id);
	}

	async function handleDismissAll() {
		if (!userId) return;
		const ids = notifications.map((item) => item.id);
		if (ids.length === 0) return;
		await dismissAllNotifications(ids);
		notifications = [];
	}
</script>

<PageTitle title="Notifications" />

<div class="container mx-auto max-w-3xl px-4 py-8">
	<div class="mb-6 flex items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl font-bold">Notifications</h1>
			<p class="text-sm text-base-content/70">All current portal notifications.</p>
		</div>
		{#if notifications.length > 0}
			<button type="button" class="btn btn-ghost btn-sm" onclick={handleDismissAll}>
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
					<NotificationListItem {notification} onDismiss={handleDismiss} />
				{/each}
			</div>
		{/if}
	</div>
</div>
