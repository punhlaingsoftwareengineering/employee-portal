import { describe, expect, it } from 'vitest';
import { exportFilename, rowsToCsv } from './table-export';

describe('rowsToCsv', () => {
	it('escapes commas and quotes', () => {
		const csv = rowsToCsv(
			[{ name: 'A, B', note: 'say "hi"' }],
			[
				{ header: 'Name', value: (row) => row.name },
				{ header: 'Note', value: (row) => row.note }
			]
		);
		expect(csv).toBe('Name,Note\n"A, B","say ""hi"""');
	});

	it('renders empty cells for nullish values', () => {
		const csv = rowsToCsv(
			[{ name: null, active: true }],
			[
				{ header: 'Name', value: (row) => row.name },
				{ header: 'Active', value: (row) => row.active }
			]
		);
		expect(csv).toBe('Name,Active\n,true');
	});
});

describe('exportFilename', () => {
	it('uses entity base name and ISO date', () => {
		expect(exportFilename('employees', 'csv', new Date(2026, 7, 21))).toBe(
			'employees-export-2026-08-21.csv'
		);
	});
});
