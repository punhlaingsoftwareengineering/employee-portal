const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Generated PKs (missing Emp No) must not be shown as employee IDs. */
export function isPlaceholderEmployeeId(id: string | null | undefined): boolean {
	const value = id?.trim() ?? '';
	if (!value) return true;
	if (value.startsWith('nf-')) return true;
	return UUID_RE.test(value);
}

export function displayEmployeeId(id: string | null | undefined): string {
	if (isPlaceholderEmployeeId(id)) return '—';
	return id!.trim();
}

/** Use Emp No as the row id when present; otherwise an internal UUID. */
export function newEmployeeRowId(employeeNo: string | null | undefined): string {
	const value = employeeNo?.trim();
	return value ? value : crypto.randomUUID();
}
