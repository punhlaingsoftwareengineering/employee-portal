import type { PublicNotification } from '$lib/schemas/notification';

type Listener = (payload: PublicNotification) => void;

const listeners = new Set<Listener>();

export function subscribeNotifications(listener: Listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function publishNotification(payload: PublicNotification) {
	for (const listener of listeners) {
		listener(payload);
	}
}
