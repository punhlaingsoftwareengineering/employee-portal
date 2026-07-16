/** Lowercase slug for role names: letters, digits, `_`, `-`; must start with a letter. */
export function slugifyName(name: string, maxLength = 40): string {
	let slug = name
		.trim()
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-{2,}/g, '-')
		.replace(/^-+|-+$/g, '');

	if (!slug) slug = 'role';
	if (!/^[a-z]/.test(slug)) slug = `r-${slug}`;

	slug = slug.slice(0, maxLength).replace(/-+$/, '');
	return slug || 'role';
}

export const ACCESS_ROLE_SLUG_REGEX = /^[a-z][a-z0-9_-]*$/;
