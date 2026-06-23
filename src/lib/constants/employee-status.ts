export const EMPLOYEE_STATUSES = ['active', 'inactive', 'on_leave'] as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUSES)[number];
