import { browser } from '$app/env';
import {
	dashboardPinKey,
	dashboardPinsStorageKey,
	parseDashboardPinKey,
	type DashboardPinKey,
	type DashboardPinKind
} from '$lib/constants/dashboard-pins';

function normalizePins(raw: unknown): DashboardPinKey[] {
	if (!Array.isArray(raw)) return [];

	const seen = new Set<DashboardPinKey>();
	const pins: DashboardPinKey[] = [];

	for (const item of raw) {
		if (typeof item !== 'string') continue;
		const parsed = parseDashboardPinKey(item);
		if (!parsed) continue;
		const key = dashboardPinKey(parsed.kind, parsed.id);
		if (seen.has(key)) continue;
		seen.add(key);
		pins.push(key);
	}

	return pins;
}

class DashboardPinsState {
	pins = $state<DashboardPinKey[]>([]);
	private userId: string | null = null;

	hydrate(userId: string) {
		if (!browser) return;

		if (this.userId !== userId) {
			this.userId = userId;
			try {
				const raw = localStorage.getItem(dashboardPinsStorageKey(userId));
				this.pins = raw ? normalizePins(JSON.parse(raw)) : [];
			} catch {
				this.pins = [];
			}
		}
	}

	isPinned(kind: DashboardPinKind, id: string): boolean {
		return this.pins.includes(dashboardPinKey(kind, id));
	}

	toggle(kind: DashboardPinKind, id: string) {
		const key = dashboardPinKey(kind, id);
		this.pins = this.pins.includes(key)
			? this.pins.filter((value) => value !== key)
			: [...this.pins, key];
		this.persist();
	}

	private persist() {
		if (!browser || !this.userId) return;
		localStorage.setItem(dashboardPinsStorageKey(this.userId), JSON.stringify(this.pins));
	}
}

export const dashboardPins = new DashboardPinsState();
