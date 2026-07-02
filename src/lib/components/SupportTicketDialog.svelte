<script lang="ts">
	import { AUTH_ROUTES } from '$lib/constants/auth-routes';
	import {
		DEFAULT_SUPPORT_TICKET_CATEGORY,
		DEFAULT_SUPPORT_TICKET_URGENCY,
		SUPPORT_TICKET_CATEGORY_LABELS,
		SUPPORT_TICKET_CATEGORY_OPTIONS,
		SUPPORT_TICKET_STATUS_LABELS,
		SUPPORT_TICKET_URGENCY_LABELS,
		SUPPORT_TICKET_URGENCY_OPTIONS,
		type SupportTicketCategory,
		type SupportTicketStatus,
		type SupportTicketUrgency
	} from '$lib/constants/support-ticket';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import {
		createSupportTicket,
		getMySupportTickets
	} from '$lib/remotes/support-ticket.remote';
	import type { User } from 'better-auth';
	import { LifeBuoy } from '@lucide/svelte';

	let { user = null }: { user?: User | null } = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let activeTab = $state<'new' | 'mine'>('new');
	let category = $state<SupportTicketCategory>(DEFAULT_SUPPORT_TICKET_CATEGORY);
	let urgency = $state<SupportTicketUrgency>(DEFAULT_SUPPORT_TICKET_URGENCY);
	let contactPhone = $state('');
	let subject = $state('');
	let description = $state('');
	let guestName = $state('');
	let guestEmail = $state('');
	let submitting = $state(false);
	let error = $state<string | null>(null);

	const isLoggedIn = $derived(Boolean(user?.id));

	export function open() {
		error = null;
		submitting = false;
		activeTab = 'new';
		dialog?.showModal();
	}

	function close() {
		dialog?.close();
		resetForm();
	}

	function resetForm() {
		category = DEFAULT_SUPPORT_TICKET_CATEGORY;
		urgency = DEFAULT_SUPPORT_TICKET_URGENCY;
		contactPhone = '';
		subject = '';
		description = '';
		guestName = '';
		guestEmail = '';
		error = null;
		submitting = false;
	}

	function statusBadgeClass(status: SupportTicketStatus): string {
		switch (status) {
			case 'open':
				return 'badge-info';
			case 'in_progress':
				return 'badge-warning';
			case 'resolved':
				return 'badge-success';
			case 'closed':
				return 'badge-neutral';
		}
	}

	function urgencyBadgeClass(level: SupportTicketUrgency): string {
		switch (level) {
			case 'low':
				return 'badge-ghost';
			case 'normal':
				return 'badge-outline';
			case 'high':
				return 'badge-warning';
			case 'urgent':
				return 'badge-error';
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const trimmedSubject = subject.trim();
			const trimmedDescription = description.trim();

			if (!trimmedSubject) {
				error = 'Subject is required';
				return;
			}
			if (!trimmedDescription) {
				error = 'Description is required';
				return;
			}

			await createSupportTicket({
				category,
				urgency,
				contactPhone: contactPhone.trim() || undefined,
				subject: trimmedSubject,
				description: trimmedDescription,
				...(isLoggedIn
					? {}
					: {
							guestName: guestName.trim(),
							guestEmail: guestEmail.trim()
						})
			});

			resetForm();
			if (isLoggedIn) {
				activeTab = 'mine';
				void getMySupportTickets().refresh();
			} else {
				close();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to submit ticket';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit max-h-[90vh] overflow-y-auto">
		<h3 class="flex items-center gap-2 text-lg font-bold">
			<LifeBuoy class="h-5 w-5 text-primary" />
			Support ticket
		</h3>
		<p class="mt-1 text-sm text-base-content/70">
			Submit a ticket and our team will get back to you.
		</p>

		<div role="tablist" class="tabs tabs-boxed mt-4 w-full">
			<button
				type="button"
				role="tab"
				class="tab flex-1"
				class:tab-active={activeTab === 'new'}
				onclick={() => (activeTab = 'new')}
			>
				New ticket
			</button>
			<button
				type="button"
				role="tab"
				class="tab flex-1"
				class:tab-active={activeTab === 'mine'}
				onclick={() => (activeTab = 'mine')}
			>
				My tickets
			</button>
		</div>

		{#if activeTab === 'new'}
			<form class="mt-6" onsubmit={handleSubmit}>
				<table class="form-table">
					<tbody>
						{#if !isLoggedIn}
							<tr>
								<td class="form-table-label">Your name</td>
								<td class="form-table-field">
									<input
										class="input input-bordered w-full max-w-md"
										bind:value={guestName}
										required
										autocomplete="name"
									/>
								</td>
							</tr>
							<tr>
								<td class="form-table-label">Email</td>
								<td class="form-table-field">
									<input
										type="email"
										class="input input-bordered w-full max-w-md"
										bind:value={guestEmail}
										required
										autocomplete="email"
									/>
								</td>
							</tr>
						{/if}
						<tr>
							<td class="form-table-label">Category</td>
							<td class="form-table-field">
								<select
									class="select select-bordered w-full max-w-md"
									bind:value={category}
									required
								>
									{#each SUPPORT_TICKET_CATEGORY_OPTIONS as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Urgency</td>
							<td class="form-table-field">
								<select
									class="select select-bordered w-full max-w-md"
									bind:value={urgency}
									required
								>
									{#each SUPPORT_TICKET_URGENCY_OPTIONS as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Phone</td>
							<td class="form-table-field">
								<input
									type="tel"
									class="input input-bordered w-full max-w-md"
									bind:value={contactPhone}
									autocomplete="tel"
									placeholder="Optional callback number"
									maxlength={40}
								/>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Subject</td>
							<td class="form-table-field">
								<input
									class="input input-bordered w-full max-w-md"
									bind:value={subject}
									required
									maxlength={200}
								/>
							</td>
						</tr>
						<tr>
							<td class="form-table-label align-top">Description</td>
							<td class="form-table-field">
								<textarea
									class="textarea textarea-bordered w-full max-w-md"
									rows="5"
									bind:value={description}
									required
									maxlength={5000}
									placeholder="Steps to reproduce, expected behavior, screenshots links, etc."
								></textarea>
							</td>
						</tr>
					</tbody>
				</table>

				{#if error}
					<div class="alert alert-error mt-4">
						<span>{error}</span>
					</div>
				{/if}

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={close} disabled={submitting}>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={submitting}>
						{#if submitting}
							<LoadingSpinner size="sm" />
						{:else}
							Submit ticket
						{/if}
					</button>
				</div>
			</form>
		{:else if isLoggedIn}
			<svelte:boundary>
				{@const tickets = await getMySupportTickets()}

				<div class="mt-6">
					{#if tickets.length === 0}
						<p class="text-sm text-base-content/60">You have not submitted any tickets yet.</p>
					{:else}
						<ul class="divide-y divide-base-200 rounded-box border border-base-300">
							{#each tickets as ticket (ticket.id)}
								<li class="p-4">
									<div class="flex flex-wrap items-start justify-between gap-2">
										<div class="min-w-0">
											<p class="font-semibold">{ticket.subject}</p>
											<p class="mt-1 text-xs text-base-content/60">
												{SUPPORT_TICKET_CATEGORY_LABELS[ticket.category]}
											</p>
											<p class="mt-1 line-clamp-2 text-sm text-base-content/70">
												{ticket.description}
											</p>
											<p class="mt-2 text-xs text-base-content/50">
												{new Date(ticket.createdAt).toLocaleString()}
											</p>
										</div>
										<div class="flex flex-col items-end gap-1">
											<span class="badge badge-outline {statusBadgeClass(ticket.status)}">
												{SUPPORT_TICKET_STATUS_LABELS[ticket.status]}
											</span>
											<span class="badge badge-outline {urgencyBadgeClass(ticket.urgency)}">
												{SUPPORT_TICKET_URGENCY_LABELS[ticket.urgency]}
											</span>
										</div>
									</div>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="modal-action">
					<button type="button" class="btn btn-ghost" onclick={close}>Close</button>
				</div>

				{#snippet pending()}
					<div class="mt-6 flex justify-center py-8">
						<LoadingCenter />
					</div>
				{/snippet}

				{#snippet failed(loadError)}
					<div class="alert alert-error mt-6">
						<span>
							{loadError instanceof Error ? loadError.message : 'Failed to load tickets'}
						</span>
					</div>
				{/snippet}
			</svelte:boundary>
		{:else}
			<div class="mt-6 text-center">
				<p class="text-sm text-base-content/70">
					Sign in to view tickets linked to your account.
				</p>
				<a href={AUTH_ROUTES.login} class="btn btn-primary btn-sm mt-4">Sign in</a>
			</div>
			<div class="modal-action">
				<button type="button" class="btn btn-ghost" onclick={close}>Close</button>
			</div>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
