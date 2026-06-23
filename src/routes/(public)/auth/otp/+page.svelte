<script lang="ts">
	import { enhance } from '$app/forms';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import { createFormLoading } from '$lib/form-loading.svelte';
	import type { ActionData, PageData } from './$types';

	let { form, data }: { form: ActionData; data: PageData } = $props();
	const verifyLoading = createFormLoading();
	const resendLoading = createFormLoading();
</script>

<h1 class="text-2xl font-bold">Verification code</h1>

<div class="card bg-base-100 shadow-sm">
	<div class="card-body">
		{#if form?.resent}
			<div class="alert alert-success mb-4">
				<span>A new code was sent to your email.</span>
			</div>
		{/if}

		<p class="mb-4 text-sm opacity-80">Enter the one-time code sent to your email after sign up.</p>

		<form method="post" action="?/verify" use:enhance={verifyLoading.enhanceSubmit}>
			<input type="hidden" name="redirectTo" value={data.redirectTo} />

			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Email</td>
						<td class="form-table-field">
							<input
								type="email"
								name="email"
								value={data.email}
								class="input input-bordered w-full max-w-md"
								required
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Code</td>
						<td class="form-table-field">
							<input
								type="text"
								name="otp"
								class="input input-bordered w-full max-w-md"
								inputmode="numeric"
								autocomplete="one-time-code"
								required
							/>
						</td>
					</tr>
				</tbody>
			</table>

			<div class="form-actions">
				<button type="submit" class="btn btn-primary gap-2" disabled={verifyLoading.submitting}>
					{#if verifyLoading.submitting}
						<LoadingSpinner size="sm" />
					{/if}
					Verify email
				</button>
			</div>
		</form>

		<form method="post" action="?/resend" use:enhance={resendLoading.enhanceSubmit} class="mt-4">
			<input type="hidden" name="email" value={data.email} />
			<div class="form-actions">
				<button type="submit" class="btn btn-outline gap-2" disabled={resendLoading.submitting}>
					{#if resendLoading.submitting}
						<LoadingSpinner size="sm" />
					{/if}
					Resend code
				</button>
			</div>
		</form>

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
