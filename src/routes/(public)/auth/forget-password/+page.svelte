<script lang="ts">
	import { enhance } from '$app/forms';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import { createFormLoading } from '$lib/form-loading.svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	const formLoading = createFormLoading();
</script>

<h1 class="text-2xl font-bold">Forgot password</h1>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		{#if form?.success}
			<div class="alert alert-success">
				<span>If this email exists in our system, check your inbox for a reset link.</span>
			</div>
		{:else}
			<p class="mb-4 text-sm opacity-80">Enter your email and we will send you a reset link.</p>

			<form method="post" use:enhance={formLoading.enhanceSubmit}>
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
					</tbody>
				</table>

				<div class="form-actions">
					<button type="submit" class="btn btn-primary gap-2" disabled={formLoading.submitting}>
						{#if formLoading.submitting}
							<LoadingSpinner size="sm" />
						{/if}
						Send reset link
					</button>
				</div>
			</form>
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
