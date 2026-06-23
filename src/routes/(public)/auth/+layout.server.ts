import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$app/env/private';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = () => ({
	githubEnabled: Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET)
});
