export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastItem = {
	id: number;
	message: string;
	type: ToastType;
};

let nextId = 1;
export const toasts = $state<ToastItem[]>([]);

const DEFAULT_DURATION_MS = 4200;

export function dismissToast(id: number) {
	const index = toasts.findIndex((item) => item.id === id);
	if (index !== -1) toasts.splice(index, 1);
}

export function clearToasts() {
	toasts.splice(0, toasts.length);
}

export function showToast(message: string, type: ToastType = 'info', durationMs = DEFAULT_DURATION_MS) {
	const id = nextId++;
	toasts.push({ id, message, type });
	if (durationMs > 0) {
		setTimeout(() => dismissToast(id), durationMs);
	}
	return id;
}

export const toast = {
	success: (message: string, durationMs?: number) => showToast(message, 'success', durationMs),
	error: (message: string, durationMs?: number) => showToast(message, 'error', durationMs),
	warning: (message: string, durationMs?: number) => showToast(message, 'warning', durationMs),
	info: (message: string, durationMs?: number) => showToast(message, 'info', durationMs)
};
