<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import { KeyRound, LogOut, Mail, Shield, User } from '@lucide/svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import { createFormLoading } from '$lib/form-loading.svelte';
	import { createKeyedLoading } from '$lib/keyed-loading.svelte';
	import { requestOwnPasswordReset } from '$lib/remotes/auth.remote';

	let {
		logoutFormId = 'profile-logout'
	}: {
		logoutFormId?: string;
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	const logoutLoading = createFormLoading();
	const resetLoading = createKeyedLoading();

	const user = $derived(page.data.user);
	const permissions = $derived(page.data.permissions);
	const displayName = $derived(user?.name?.trim() || user?.email || 'Account');

	const roleLabels = $derived.by(() => {
		const labels: string[] = [];
		if (permissions?.isAdmin) labels.push('Admin');
		if (permissions?.isGuest) labels.push('Guest');
		for (const assignment of permissions?.departmentRoles ?? []) {
			const roleName = assignment.roleName?.trim();
			if (roleName && !labels.includes(roleName)) labels.push(roleName);
		}
		return labels;
	});

	export function open() {
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
	}

	async function sendPasswordReset() {
		if (!user?.email) return;
		await resetLoading.run('reset', async () => {
			await withFormFeedback({
				successMessage: 'Password reset link sent — check your email.',
				errorMessage: 'Could not send reset email',
				action: async () => {
					await requestOwnPasswordReset();
				}
			});
			close();
		});
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">Profile</h3>

		{#if user}
			<table class="form-table mt-6">
				<tbody>
					<tr>
						<td class="form-table-label">Name</td>
						<td class="form-table-field">
							<span class="inline-flex items-center gap-2">
								<User class="h-4 w-4 shrink-0 opacity-60" />
								{displayName}
							</span>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Email</td>
						<td class="form-table-field">
							<span class="inline-flex items-center gap-2 break-all">
								<Mail class="h-4 w-4 shrink-0 opacity-60" />
								{user.email}
							</span>
						</td>
					</tr>
					{#if roleLabels.length > 0}
						<tr>
							<td class="form-table-label">Access</td>
							<td class="form-table-field">
								<div class="flex flex-wrap gap-2">
									{#each roleLabels as label (label)}
										<span class="badge badge-outline gap-1">
											<Shield class="h-3 w-3" />
											{label}
										</span>
									{/each}
								</div>
							</td>
						</tr>
					{/if}
				</tbody>
			</table>
		{:else}
			<p class="mt-6 text-sm text-base-content/70">No signed-in user found.</p>
		{/if}

		<form
			id={logoutFormId}
			method="post"
			action={AUTH_ROUTES.logout}
			class="hidden"
			use:enhance={logoutLoading.enhanceSubmit}
		></form>

		<div class="modal-action flex-col items-stretch gap-2 sm:flex-col">
			<button
				type="button"
				class="btn btn-outline gap-2"
				disabled={!user?.email || resetLoading.isPending('reset')}
				onclick={() => void sendPasswordReset()}
			>
				{#if resetLoading.isPending('reset')}
					<LoadingSpinner size="sm" />
				{:else}
					<KeyRound class="h-4 w-4" />
				{/if}
				Forgot password
			</button>
			<button
				type="submit"
				form={logoutFormId}
				class="btn btn-error gap-2"
				disabled={logoutLoading.submitting || resetLoading.isPending('reset')}
			>
				{#if logoutLoading.submitting}
					<LoadingSpinner size="sm" />
				{:else}
					<LogOut class="h-4 w-4" />
				{/if}
				Sign out
			</button>
			<button type="button" class="btn btn-ghost" onclick={close}>Close</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
