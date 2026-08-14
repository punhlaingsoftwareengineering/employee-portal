import * as XLSX from 'xlsx';

function cellToString(value: unknown): string | null {
	if (value === null || value === undefined) return null;
	if (typeof value === 'string') {
		const trimmed = value.trim();
		return trimmed.length > 0 ? trimmed : null;
	}
	if (typeof value === 'number' && Number.isFinite(value)) return String(value);
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString();
	}
	return String(value).trim() || null;
}

const MONTH_INDEX: Record<string, number> = {
	jan: 0,
	feb: 1,
	mar: 2,
	apr: 3,
	may: 4,
	jun: 5,
	jul: 6,
	aug: 7,
	sep: 8,
	oct: 9,
	nov: 10,
	dec: 11
};

function excelSerialToIsoDate(serial: number): string | null {
	if (!Number.isFinite(serial)) return null;
	const utcDays = Math.floor(serial - 25569);
	const utcValue = utcDays * 86400 * 1000;
	const date = new Date(utcValue);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString().slice(0, 10);
}

function isoDate(year: number, monthIndex: number, day: number): string | null {
	if (!Number.isInteger(year) || !Number.isInteger(day) || monthIndex < 0 || monthIndex > 11) {
		return null;
	}
	const date = new Date(Date.UTC(year, monthIndex, day));
	if (
		date.getUTCFullYear() !== year ||
		date.getUTCMonth() !== monthIndex ||
		date.getUTCDate() !== day
	) {
		return null;
	}
	return date.toISOString().slice(0, 10);
}

/** Parse HR-style dates like `01-Jul-2024`, `1 Jul 2024`, `01/07/2024`. */
function parseFlexibleDateString(raw: string): string | null {
	const value = raw.replace(/\u00a0/g, ' ').trim();
	if (!value) return null;
	if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);

	const dayMonYear = /^(\d{1,2})[-\/ ]([A-Za-z]{3,9})[-\/ ](\d{4})$/.exec(value);
	if (dayMonYear) {
		const day = Number(dayMonYear[1]);
		const monthIndex = MONTH_INDEX[dayMonYear[2].slice(0, 3).toLowerCase()];
		const year = Number(dayMonYear[3]);
		if (monthIndex == null) return null;
		return isoDate(year, monthIndex, day);
	}

	const dmy = /^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})$/.exec(value);
	if (dmy) {
		const day = Number(dmy[1]);
		const month = Number(dmy[2]);
		const year = Number(dmy[3]);
		return isoDate(year, month - 1, day);
	}

	return null;
}

export function parseExcelBoolean(value: unknown): boolean | null {
	if (value === null || value === undefined || value === '') return null;
	if (typeof value === 'boolean') return value;
	if (typeof value === 'number') return value !== 0;
	const normalized = String(value).trim().toLowerCase();
	if (!normalized) return null;
	if (['1', 'true', 'yes', 'y', 'active'].includes(normalized)) return true;
	if (['0', 'false', 'no', 'n', 'inactive'].includes(normalized)) return false;
	return null;
}

export function parseExcelDate(value: unknown): string | null {
	if (value === null || value === undefined || value === '') return null;
	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return value.toISOString().slice(0, 10);
	}
	if (typeof value === 'number') return excelSerialToIsoDate(value);
	return parseFlexibleDateString(String(value));
}

export function parseExcelTimestamp(value: unknown): Date | null {
	if (value === null || value === undefined || value === '') return null;
	if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
	if (typeof value === 'number') {
		const isoDate = excelSerialToIsoDate(value);
		return isoDate ? new Date(`${isoDate}T00:00:00.000Z`) : null;
	}
	const raw = String(value).trim();
	if (!raw) return null;
	const parsed = new Date(raw);
	return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeExcelColumn(key: string): string {
	return key
		.replace(/^\uFEFF/, '')
		.replace(/\u00a0/g, ' ')
		.trim()
		.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
		.replace(/[\s-]+/g, '_')
		.toLowerCase();
}

function normalizeExcelRow(row: Record<string, unknown>): Record<string, unknown> {
	const normalized: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(row)) {
		normalized[normalizeExcelColumn(key)] = value;
	}
	return normalized;
}

function sheetToRows(sheet: XLSX.WorkSheet): Record<string, unknown>[] {
	const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
		defval: null,
		raw: true,
		blankrows: false
	});

	return rows
		.map(normalizeExcelRow)
		.filter((row) => Object.values(row).some((value) => cellToString(value) !== null));
}

function employeeSheetScore(rows: Record<string, unknown>[]): number {
	if (rows.length === 0) return 0;
	const keys = new Set(Object.keys(rows[0] ?? {}));
	let score = 0;
	if (keys.has('emp_no') || keys.has('employee_no') || keys.has('employeeno') || keys.has('id')) {
		score += 3;
	}
	if (keys.has('name') || keys.has('employee_name') || keys.has('employeename')) score += 3;
	if (keys.has('position')) score += 1;
	if (keys.has('department')) score += 1;
	if (keys.has('facility')) score += 1;
	if (keys.has('joined_date') || keys.has('join_date') || keys.has('joindate')) score += 1;
	return score;
}

export function parseExcelRows(fileBytes: Uint8Array): Record<string, unknown>[] {
	const workbook = XLSX.read(fileBytes, { type: 'array', cellDates: true });
	const firstSheetName = workbook.SheetNames[0];
	if (!firstSheetName) return [];
	const sheet = workbook.Sheets[firstSheetName];
	if (!sheet) return [];
	return sheetToRows(sheet);
}

/** HR employee workbooks often have a named data sheet plus a leftover Sheet1. */
export function parseEmployeeExcelRows(fileBytes: Uint8Array): Record<string, unknown>[] {
	const workbook = XLSX.read(fileBytes, { type: 'array', cellDates: true });
	let best: Record<string, unknown>[] = [];
	let bestScore = -1;

	for (const sheetName of workbook.SheetNames) {
		const sheet = workbook.Sheets[sheetName];
		if (!sheet) continue;
		const rows = sheetToRows(sheet);
		const score = employeeSheetScore(rows);
		if (score > bestScore || (score === bestScore && rows.length > best.length)) {
			best = rows;
			bestScore = score;
		}
	}

	return best;
}

/** Employee numbers in HR files are zero-padded strings (e.g. 00952). */
export function excelEmployeeNo(row: Record<string, unknown>, ...keys: string[]): string | null {
	for (const key of keys) {
		const value = row[key];
		if (value === null || value === undefined || value === '') continue;
		if (typeof value === 'number' && Number.isFinite(value)) {
			if (Number.isInteger(value) && value >= 0) {
				return String(value).padStart(5, '0');
			}
			return String(value);
		}
		const text = cellToString(value);
		if (text) return text.replace(/\s+/g, '');
	}
	return null;
}

export function excelText(row: Record<string, unknown>, ...keys: string[]): string | null {
	for (const key of keys) {
		const value = cellToString(row[key]);
		if (value !== null) return value;
	}
	return null;
}

export function decodeExcelBase64(fileBase64: string): Uint8Array {
	const payload = fileBase64.includes(',') ? fileBase64.split(',').pop()! : fileBase64;
	const binary = atob(payload);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}
