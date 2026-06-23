<script lang="ts">
	import { enhance } from '$app/forms';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { createFormLoading } from '$lib/form-loading.svelte';
	import { Clock, LogOut } from 'lucide-svelte';

	const logoutLoading = createFormLoading();
</script>

<div class="mx-auto flex max-w-lg flex-col items-center gap-6 py-16 text-center">
	<Clock class="h-16 w-16 text-warning" />
	<h1 class="text-2xl font-bold">Waiting for access</h1>
	<p class="text-base-content/70">
		Your account is active, but an administrator has not assigned portal access yet. You will be
		able to use the employee portal once your role is configured.
	</p>
	<form method="post" action={AUTH_ROUTES.logout} use:enhance={logoutLoading.enhanceSubmit}>
		<button type="submit" class="btn btn-outline gap-2" disabled={logoutLoading.submitting}>
			{#if logoutLoading.submitting}
				<LoadingSpinner size="sm" />
			{:else}
				<LogOut class="h-4 w-4" />
			{/if}
			Sign out
		</button>
	</form>
</div>
