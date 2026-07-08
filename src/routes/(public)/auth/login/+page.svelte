<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import { createFormLoading } from '$lib/form-loading.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();

	const redirectTo = $derived(page.url.searchParams.get('redirectTo') ?? '/dashboard');
	const signInLoading = createFormLoading();
</script>

<h1 class="text-2xl font-bold">Sign in</h1>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<form method="post" action="?/signInEmail" use:enhance={signInLoading.enhanceSubmit}>
			<input type="hidden" name="redirectTo" value={redirectTo} />

			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Email</td>
						<td class="form-table-field">
							<input
								type="email"
								name="email"
								class="input input-bordered w-full max-w-md"
								required
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Password</td>
						<td class="form-table-field">
							<PasswordInput name="password" autocomplete="current-password" required />
						</td>
					</tr>
				</tbody>
			</table>

			<div class="form-actions">
				<button
					type="submit"
					class="btn btn-primary gap-2"
					disabled={signInLoading.submitting}
				>
					{#if signInLoading.submitting}
						<LoadingSpinner size="sm" />
					{/if}
					Sign in
				</button>
			</div>
		</form>

		<p class="mt-4 text-center text-sm">
			<a href={AUTH_ROUTES.forgetPassword} class="link link-hover">Forgot password?</a>
			<span class="mx-2">·</span>
			<a
				href="{AUTH_ROUTES.signup}{redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}"
				class="link link-hover">Create account</a
			>
		</p>
	</div>
</div>

{#if form?.message}
	<div class="alert alert-error">
		<span>{form.message}</span>
	</div>
{/if}
