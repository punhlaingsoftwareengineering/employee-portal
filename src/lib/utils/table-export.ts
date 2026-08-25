import * as XLSX from 'xlsx';
import { downloadBlob } from '$lib/utils/download';

export type ExportColumn<T> = {
	header: string;
	value: (row: T) => string | number | boolean | null | undefined;
};

export type TableExportFormat = 'csv' | 'xlsx';

function cellText(value: string | number | boolean | null | undefined): string {
	if (value == null) return '';
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	return String(value);
}

export function rowsToAoA<T>(rows: T[], columns: ExportColumn<T>[]): (string | number)[][] {
	const header = columns.map((column) => column.header);
	const body = rows.map((row) =>
		columns.map((column) => {
			const raw = column.value(row);
			if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
			return cellText(raw);
		})
	);
	return [header, ...body];
}

function escapeCsvCell(value: string | number): string {
	const text = String(value);
	if (/[",\n\r]/.test(text)) {
		return `"${text.replace(/"/g, '""')}"`;
	}
	return text;
}

export function rowsToCsv<T>(rows: T[], columns: ExportColumn<T>[]): string {
	return rowsToAoA(rows, columns)
		.map((line) => line.map(escapeCsvCell).join(','))
		.join('\n');
}

export function exportFilename(fileBaseName: string, format: TableExportFormat, now = new Date()) {
	const yyyy = now.getFullYear();
	const mm = String(now.getMonth() + 1).padStart(2, '0');
	const dd = String(now.getDate()).padStart(2, '0');
	return `${fileBaseName}-export-${yyyy}-${mm}-${dd}.${format}`;
}

export function exportRowsAsCsv<T>(
	rows: T[],
	columns: ExportColumn<T>[],
	fileBaseName: string
): void {
	const csv = rowsToCsv(rows, columns);
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
	downloadBlob(blob, exportFilename(fileBaseName, 'csv'));
}

export function exportRowsAsXlsx<T>(
	rows: T[],
	columns: ExportColumn<T>[],
	fileBaseName: string
): void {
	const sheet = XLSX.utils.aoa_to_sheet(rowsToAoA(rows, columns));
	const workbook = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(workbook, sheet, 'Export');
	const bytes = new Uint8Array(
		XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }) as ArrayLike<number>
	);
	const blob = new Blob([bytes], {
		type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	});
	downloadBlob(blob, exportFilename(fileBaseName, 'xlsx'));
}

export function exportTableRows<T>(
	rows: T[],
	columns: ExportColumn<T>[],
	fileBaseName: string,
	format: TableExportFormat
): void {
	if (format === 'csv') {
		exportRowsAsCsv(rows, columns, fileBaseName);
		return;
	}
	exportRowsAsXlsx(rows, columns, fileBaseName);
}
