<script lang="ts">
	import { enhance } from '$app/forms';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import { createFormLoading } from '$lib/form-loading.svelte';
	import type { ActionData, PageData } from './$types';

	let { form, data }: { form: ActionData; data: PageData } = $props();
	const formLoading = createFormLoading();
</script>

<h1 class="text-2xl font-bold">Reset password</h1>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		{#if data.error}
			<div class="alert alert-error">
				<span>{data.error}</span>
			</div>
			<p class="mt-4 text-center text-sm">
				<a href={AUTH_ROUTES.forgetPassword} class="link link-hover">Request a new link</a>
			</p>
		{:else if data.token}
			<form method="post" use:enhance={formLoading.enhanceSubmit}>
				<input type="hidden" name="token" value={data.token} />

				<table class="form-table">
					<tbody>
						<tr>
							<td class="form-table-label">New password</td>
							<td class="form-table-field">
								<PasswordInput name="password" autocomplete="new-password" required />
							</td>
						</tr>
					</tbody>
				</table>

				<div class="form-actions">
					<button type="submit" class="btn btn-primary gap-2" disabled={formLoading.submitting}>
						{#if formLoading.submitting}
							<LoadingSpinner size="sm" />
						{/if}
						Update password
					</button>
				</div>
			</form>
		{:else}
			<div class="alert alert-warning">
				<span>Open the reset link from your email to set a new password.</span>
			</div>
		{/if}

		<p class="mt-4 text-center text-sm">
			<a href={AUTH_ROUTES.login} class="link link-hover">Back to sign in</a>
		</p>
	</div>
</div>

{#if form?.message}
	<div class="alert alert-error">
		<span>{form.message}</span>
	</div>
{/if}
