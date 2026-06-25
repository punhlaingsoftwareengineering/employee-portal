import { browser } from '$app/environment';
import {
	DISMISSED_NOTIFICATIONS_KEY,
	NOTIFICATIONS_MUTED_KEY
} from '$lib/constants/notification';

export function loadDismissedNotificationIds(): Set<string> {
	if (!browser) return new Set();

	try {
		const raw = localStorage.getItem(DISMISSED_NOTIFICATIONS_KEY);
		if (!raw) return new Set();
		const parsed = JSON.parse(raw);
		return new Set(Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : []);
	} catch {
		return new Set();
	}
}

export function saveDismissedNotificationIds(ids: Set<string>) {
	if (!browser) return;
	localStorage.setItem(DISMISSED_NOTIFICATIONS_KEY, JSON.stringify([...ids]));
}

export function dismissNotificationLocally(id: string) {
	const ids = loadDismissedNotificationIds();
	ids.add(id);
	saveDismissedNotificationIds(ids);
}

export function dismissAllNotificationsLocally(ids: string[]) {
	const dismissed = loadDismissedNotificationIds();
	for (const id of ids) dismissed.add(id);
	saveDismissedNotificationIds(dismissed);
}

export function loadNotificationsMuted(): boolean {
	if (!browser) return false;
	return localStorage.getItem(NOTIFICATIONS_MUTED_KEY) === 'true';
}

export function saveNotificationsMuted(muted: boolean) {
	if (!browser) return;
	localStorage.setItem(NOTIFICATIONS_MUTED_KEY, muted ? 'true' : 'false');
}

export function playNotificationSound(audioUrl: string | null | undefined) {
	if (!audioUrl || loadNotificationsMuted()) return;

	const audio = new Audio(audioUrl);
	void audio.play().catch(() => {
		// Browser autoplay policies may block playback until user interaction.
	});
}
