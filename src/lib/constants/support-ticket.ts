export const SUPPORT_TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const;

export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUSES)[number];

export const SUPPORT_TICKET_STATUS_LABELS: Record<SupportTicketStatus, string> = {
	open: 'Open',
	in_progress: 'In progress',
	resolved: 'Resolved',
	closed: 'Closed'
};

export const SUPPORT_TICKET_STATUS_OPTIONS = SUPPORT_TICKET_STATUSES.map((value) => ({
	value,
	label: SUPPORT_TICKET_STATUS_LABELS[value]
}));

export const SUPPORT_TICKET_CATEGORIES = [
	'technical',
	'account',
	'access',
	'bug',
	'feature_request',
	'other'
] as const;

export type SupportTicketCategory = (typeof SUPPORT_TICKET_CATEGORIES)[number];

export const SUPPORT_TICKET_CATEGORY_LABELS: Record<SupportTicketCategory, string> = {
	technical: 'Technical issue',
	account: 'Account & profile',
	access: 'Access & permissions',
	bug: 'Bug report',
	feature_request: 'Feature request',
	other: 'Other'
};

export const SUPPORT_TICKET_CATEGORY_OPTIONS = SUPPORT_TICKET_CATEGORIES.map((value) => ({
	value,
	label: SUPPORT_TICKET_CATEGORY_LABELS[value]
}));

export const SUPPORT_TICKET_URGENCIES = ['low', 'normal', 'high', 'urgent'] as const;

export type SupportTicketUrgency = (typeof SUPPORT_TICKET_URGENCIES)[number];

export const SUPPORT_TICKET_URGENCY_LABELS: Record<SupportTicketUrgency, string> = {
	low: 'Low',
	normal: 'Normal',
	high: 'High',
	urgent: 'Urgent'
};

export const SUPPORT_TICKET_URGENCY_OPTIONS = SUPPORT_TICKET_URGENCIES.map((value) => ({
	value,
	label: SUPPORT_TICKET_URGENCY_LABELS[value]
}));

export const DEFAULT_SUPPORT_TICKET_CATEGORY: SupportTicketCategory = 'technical';
export const DEFAULT_SUPPORT_TICKET_URGENCY: SupportTicketUrgency = 'normal';
