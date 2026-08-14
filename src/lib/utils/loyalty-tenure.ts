/**
 * Human-readable tenure since join date (loyalty), e.g. `2y 3m`.
 * Returns `—` when joinDate is missing or invalid.
 */
export function formatLoyaltyTenure(
	joinDate: string | Date | null | undefined,
	now: Date = new Date()
): string {
	if (joinDate == null) return '—';

	const start =
		joinDate instanceof Date
			? new Date(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate())
			: parseCalendarDate(String(joinDate).trim());

	if (!start) return '—';

	const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	if (end < start) return '—';

	let years = end.getFullYear() - start.getFullYear();
	let months = end.getMonth() - start.getMonth();
	const days = end.getDate() - start.getDate();

	if (days < 0) {
		months -= 1;
	}
	if (months < 0) {
		years -= 1;
		months += 12;
	}

	if (years <= 0 && months <= 0) {
		const dayMs = 24 * 60 * 60 * 1000;
		const totalDays = Math.floor((end.getTime() - start.getTime()) / dayMs);
		return totalDays === 0 ? '0d' : `${totalDays}d`;
	}
	if (years <= 0) return `${months}m`;
	if (months <= 0) return `${years}y`;
	return `${years}y ${months}m`;
}

function parseCalendarDate(value: string): Date | null {
	const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
	if (!match) return null;
	const year = Number(match[1]);
	const month = Number(match[2]) - 1;
	const day = Number(match[3]);
	const date = new Date(year, month, day);
	if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
		return null;
	}
	return date;
}
