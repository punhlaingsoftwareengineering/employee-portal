import { browser } from '$app/env';
import {
	DEFAULT_SIDEBAR_WIDTH,
	MAX_SIDEBAR_WIDTH,
	MIN_SIDEBAR_WIDTH,
	SIDEBAR_WIDTH_STORAGE_KEY
} from '$lib/constants/app-settings';

function clampWidth(width: number): number {
	return Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, width));
}

function readStoredWidth(): number {
	if (!browser) return DEFAULT_SIDEBAR_WIDTH;

	try {
		const raw = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
		if (!raw) return DEFAULT_SIDEBAR_WIDTH;

		const parsed = Number.parseInt(raw, 10);
		if (!Number.isFinite(parsed)) return DEFAULT_SIDEBAR_WIDTH;

		return clampWidth(parsed);
	} catch {
		return DEFAULT_SIDEBAR_WIDTH;
	}
}

class SidebarLayout {
	/** Default on SSR and first client paint — hydrated from localStorage after mount. */
	width = $state(DEFAULT_SIDEBAR_WIDTH);
	resizing = $state(false);

	setWidth(px: number) {
		this.width = clampWidth(px);
	}

	persistWidth() {
		if (!browser) return;

		try {
			localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(this.width));
		} catch {
			// ignore quota / private mode
		}
	}
}

export const sidebarLayout = new SidebarLayout();

/** Call from client onMount so SSR HTML matches the initial hydration pass. */
export function hydrateSidebarLayout() {
	if (!browser) return;
	sidebarLayout.width = readStoredWidth();
}
