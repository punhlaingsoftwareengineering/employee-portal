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

function excelSerialToIsoDate(serial: number): string | null {
	if (!Number.isFinite(serial)) return null;
	const utcDays = Math.floor(serial - 25569);
	const utcValue = utcDays * 86400 * 1000;
	const date = new Date(utcValue);
	if (Number.isNaN(date.getTime())) return null;
	return date.toISOString().slice(0, 10);
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
	const raw = String(value).trim();
	if (!raw) return null;
	if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
	const parsed = new Date(raw);
	if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
	return raw;
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

export function parseExcelRows(fileBytes: Uint8Array): Record<string, unknown>[] {
	const workbook = XLSX.read(fileBytes, { type: 'array', cellDates: true });
	const firstSheetName = workbook.SheetNames[0];
	if (!firstSheetName) return [];
	const sheet = workbook.Sheets[firstSheetName];
	if (!sheet) return [];

	const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
		defval: null,
		raw: true,
		blankrows: false
	});

	return rows
		.map((row) => {
			const normalized: Record<string, unknown> = {};
			for (const [key, value] of Object.entries(row)) {
				const column = key
					.replace(/^\uFEFF/, '')
					.trim()
					.replace(/([a-z0-9])([A-Z])/g, '$1_$2')
					.replace(/[\s-]+/g, '_')
					.toLowerCase();
				normalized[column] = value;
			}
			return normalized;
		})
		.filter((row) => Object.values(row).some((value) => cellToString(value) !== null));
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
