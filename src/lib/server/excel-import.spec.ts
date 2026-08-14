import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import {
	excelEmployeeNo,
	excelText,
	parseEmployeeExcelRows,
	parseExcelDate
} from './excel-import';

describe('parseExcelDate', () => {
	it('parses HR joined dates like 01-Jul-2024', () => {
		expect(parseExcelDate('01-Jul-2024')).toBe('2024-07-01');
		expect(parseExcelDate('5 Mar 1995')).toBe('1995-03-05');
	});

	it('leaves non-date joined notes empty', () => {
		expect(parseExcelDate('Staff Family - Full time > 10 years')).toBeNull();
	});
});

describe('parseEmployeeExcelRows', () => {
	it('reads Emp No / Name / Joined Date columns', () => {
		const workbook = XLSX.utils.book_new();
		const sheet = XLSX.utils.aoa_to_sheet([
			['Emp No', 'Name', 'Position', 'Department', 'Joined Date', 'Facility'],
			['00952', 'Wunna Htun', 'Manager', 'GSS', '01-Jan-1990', 'Pun Hlaing Hospital - Taunggyi'],
			[null, 'Melvyn Pun', null, 'BOD', 'Staff Family - Full time > 10 years', 'Pun Hlaing Hospital (HTY)']
		]);
		XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['junk']]), 'Sheet1');
		XLSX.utils.book_append_sheet(workbook, sheet, '31 Jul');
		const bytes = new Uint8Array(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }));
		const rows = parseEmployeeExcelRows(bytes);
		expect(rows).toHaveLength(2);
		expect(excelEmployeeNo(rows[0]!, 'emp_no')).toBe('00952');
		expect(excelText(rows[0]!, 'name')).toBe('Wunna Htun');
		expect(parseExcelDate(rows[0]!.joined_date)).toBe('1990-01-01');
		expect(excelText(rows[1]!, 'name')).toBe('Melvyn Pun');
		expect(parseExcelDate(rows[1]!.joined_date)).toBeNull();
	});
});

describe('Jul 26 HR workbook', () => {
	it('maps the real override file when present', () => {
		let bytes: Uint8Array;
		try {
			bytes = new Uint8Array(readFileSync('/home/zarnihlawn/Downloads/Jul 26.xlsx'));
		} catch {
			return;
		}
		const rows = parseEmployeeExcelRows(bytes);
		expect(rows.length).toBeGreaterThan(1400);
		expect(excelText(rows[0]!, 'name')).toBeTruthy();
		const withEmpNo = rows.filter((row) => excelEmployeeNo(row, 'emp_no', 'employee_no'));
		expect(withEmpNo.length).toBeGreaterThan(1400);
	});
});
