export type FilterableColumn<T> = {
	id: string;
	filterText: (row: T) => string;
};

export function matchesColumnFilter(text: string, query: string): boolean {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) return true;
	return text.toLowerCase().includes(normalizedQuery);
}

export function filterRows<T>(
	rows: T[],
	columns: FilterableColumn<T>[],
	filters: Record<string, string>
): T[] {
	return rows.filter((row) =>
		columns.every((column) => {
			const query = filters[column.id] ?? '';
			return matchesColumnFilter(column.filterText(row), query);
		})
	);
}
