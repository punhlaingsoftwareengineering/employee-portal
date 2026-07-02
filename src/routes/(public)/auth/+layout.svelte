<script lang="ts">
	import { page } from '$app/state';
	import PageTitle from '$lib/components/PageTitle.svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';

	let { children } = $props();

	const AUTH_PAGE_TITLES: Record<string, string> = {
		[AUTH_ROUTES.login]: 'Sign in',
		[AUTH_ROUTES.signup]: 'Create account',
		[AUTH_ROUTES.forgetPassword]: 'Forgot password',
		[AUTH_ROUTES.resetPassword]: 'Reset password',
		[AUTH_ROUTES.otp]: 'Verification code',
		[AUTH_ROUTES.verificationSuccess]: 'Verification',
		[AUTH_ROUTES.acceptInvite]: 'Accept invitation'
	};

	const authTitle = $derived(AUTH_PAGE_TITLES[page.url.pathname] ?? '');
</script>

<PageTitle title={authTitle} />

<div class="container mx-auto w-full max-w-2xl px-4 py-10">
	<div class="w-full space-y-6">
		{@render children?.()}
	</div>
</div>
