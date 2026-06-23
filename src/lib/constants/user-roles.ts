export const PORTAL_ROLES = ['admin', 'guest', 'member'] as const;
export type PortalRole = (typeof PORTAL_ROLES)[number];

export const INVITE_STATUSES = ['pending', 'accepted', 'expired', 'revoked'] as const;
export type InviteStatus = (typeof INVITE_STATUSES)[number];

/** @deprecated Use access_role table — seeded slugs: manager, hr, viewer */
export const LEGACY_DEPARTMENT_ROLE_SLUGS = ['manager', 'hr', 'viewer'] as const;
