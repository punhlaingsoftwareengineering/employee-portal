<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { Bell, Volume2, VolumeX } from 'lucide-svelte';
	import type { PublicNotification } from '$lib/schemas/notification';
	import { NOTIFICATIONS_ROUTE } from '$lib/constants/notification';
	import NotificationListItem from '$lib/components/NotificationListItem.svelte';
	import {
		dismissAllNotificationsLocally,
		dismissNotificationLocally,
		loadDismissedNotificationIds,
		loadNotificationsMuted,
		playNotificationSound,
		saveNotificationsMuted
	} from '$lib/notification-client';
	import {
		dismissAllNotifications,
		dismissNotification
	} from '$lib/remotes/notification.remote';

	let {
		initialNotifications = [],
		defaultSoundUrl = null
	}: {
		initialNotifications?: PublicNotification[];
		defaultSoundUrl?: string | null;
	} = $props();

	let streamNotifications = $state<PublicNotification[]>([]);
	let locallyDismissed = $state<Set<string>>(loadDismissedNotificationIds());
	let muted = $state(loadNotificationsMuted());

	const userId = $derived(page.data.user?.id ?? null);
	const serverNotifications = $derived(page.data.notifications ?? initialNotifications);

	const notifications = $derived.by(() => {
		const merged = new Map<string, PublicNotification>();
		for (const item of streamNotifications) merged.set(item.id, item);
		for (const item of serverNotifications) merged.set(item.id, item);

		return [...merged.values()]
			.filter((item) => !locallyDismissed.has(item.id))
			.sort(
				(a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
			);
	});

	const dropdownNotifications = $derived(notifications.slice(0, 20));
	const unreadCount = $derived(notifications.length);
	const hasMore = $derived(notifications.length > 20);

	async function handleDismiss(id: string) {
		locallyDismissed = new Set([...locallyDismissed, id]);

		if (userId) {
			try {
				await dismissNotification(id);
			} catch {
				const next = new Set(locallyDismissed);
				next.delete(id);
				locallyDismissed = next;
			}
			return;
		}

		dismissNotificationLocally(id);
	}

	async function handleDismissAll() {
		const ids = notifications.map((item) => item.id);
		if (ids.length === 0) return;

		const previous = locallyDismissed;
		locallyDismissed = new Set([...locallyDismissed, ...ids]);

		if (userId) {
			try {
				await dismissAllNotifications(ids);
			} catch {
				locallyDismissed = previous;
			}
			return;
		}

		dismissAllNotificationsLocally(ids);
	}

	function toggleMuted() {
		muted = !muted;
		saveNotificationsMuted(muted);
	}

	onMount(() => {
		const source = new EventSource('/api/notifications/stream');

		source.addEventListener('notification', (event) => {
			try {
				const payload = JSON.parse(event.data) as PublicNotification;
				if (streamNotifications.some((item) => item.id === payload.id)) return;
				if (locallyDismissed.has(payload.id)) return;

				streamNotifications = [payload, ...streamNotifications];
				if (!muted) {
					playNotificationSound(payload.soundMp3Url ?? defaultSoundUrl);
				}
			} catch {
				// Ignore malformed SSE payloads.
			}
		});

		return () => source.close();
	});
</script>

<div class="dropdown dropdown-end">
	<div tabindex="0" role="button" class="btn btn-ghost btn-square" aria-label="Notifications">
		<div class="indicator">
			<Bell class="h-5 w-5" />
			{#if unreadCount > 0}
				<span class="badge badge-primary badge-xs indicator-item">{unreadCount > 99 ? '99+' : unreadCount}</span>
			{/if}
		</div>
	</div>
	<div
		tabindex="0"
		class="dropdown-content z-50 mt-2 w-80 rounded-box border border-base-300 bg-base-100 shadow-lg"
	>
		<div class="border-b border-base-300 px-3 py-2">
			<p class="text-sm font-semibold">Notifications</p>
		</div>

		{#if dropdownNotifications.length === 0}
			<p class="px-3 py-4 text-sm text-base-content/60">No notifications right now.</p>
		{:else}
			<div class="max-h-80 divide-y divide-base-200 overflow-y-auto">
				{#each dropdownNotifications as notification (notification.id)}
					<NotificationListItem {notification} onDismiss={handleDismiss} />
				{/each}
			</div>
		{/if}

		<div class="flex flex-wrap items-center justify-between gap-2 border-t border-base-300 px-3 py-2">
			<button
				type="button"
				class="btn btn-ghost btn-xs"
				disabled={unreadCount === 0}
				onclick={handleDismissAll}
			>
				Mark all as read
			</button>
			<button type="button" class="btn btn-ghost btn-xs gap-1" onclick={toggleMuted}>
				{#if muted}
					<VolumeX class="h-3.5 w-3.5" />
					Unmute
				{:else}
					<Volume2 class="h-3.5 w-3.5" />
					Mute
				{/if}
			</button>
			{#if hasMore}
				<a href={NOTIFICATIONS_ROUTE} class="btn btn-ghost btn-xs">View all</a>
			{/if}
		</div>
	</div>
</div>
