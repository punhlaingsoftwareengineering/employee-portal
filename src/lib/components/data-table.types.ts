import type { Snippet } from 'svelte';

export type DataTableColumnHandle<T> = {
	id: string;
	readonly label: string;
	readonly firstData: boolean;
	readonly class?: string;
	filterText: (row: T) => string;
	readonly children?: Snippet<[{ row: T }]>;
};

export type DataTableContext<T> = {
	register: (column: DataTableColumnHandle<T>) => () => void;
};
