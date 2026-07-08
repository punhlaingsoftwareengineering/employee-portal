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
	const formLoading = createFormLoading();
</script>

<h1 class="text-2xl font-bold">Create account</h1>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		<form method="post" action="?/signUpEmail" use:enhance={formLoading.enhanceSubmit}>
			<input type="hidden" name="redirectTo" value={redirectTo} />

			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Name</td>
						<td class="form-table-field">
							<input
								type="text"
								name="name"
								class="input input-bordered w-full max-w-md"
								required
							/>
						</td>
					</tr>
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
							<PasswordInput name="password" autocomplete="new-password" required />
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Confirm password</td>
						<td class="form-table-field">
							<PasswordInput name="confirmPassword" autocomplete="new-password" required />
						</td>
					</tr>
				</tbody>
			</table>

			<div class="form-actions">
				<button type="submit" class="btn btn-primary gap-2" disabled={formLoading.submitting}>
					{#if formLoading.submitting}
						<LoadingSpinner size="sm" />
					{/if}
					Create account
				</button>
			</div>
		</form>

		<p class="mt-4 text-center text-sm">
			Already have an account?
			<a
				href="{AUTH_ROUTES.login}{redirectTo !== '/dashboard' ? `?redirectTo=${encodeURIComponent(redirectTo)}` : ''}"
				class="link link-hover">Sign in</a
			>
		</p>
	</div>
</div>

{#if form?.message}
	<div class="alert alert-error">
		<span>{form.message}</span>
	</div>
{/if}
