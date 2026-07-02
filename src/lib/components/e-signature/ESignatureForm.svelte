<script lang="ts">
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { E_SIGNATURE_DEFAULT_WEB } from '$lib/constants/e-signature';
	import {
		eSignatureDefaultFormData,
		eSignatureFormSchema,
		type ESignatureFormData
	} from '$lib/schemas/e-signature';

	let {
		initialData = eSignatureDefaultFormData,
		onSubmit
	}: {
		initialData?: ESignatureFormData;
		onSubmit: (data: ESignatureFormData) => void;
	} = $props();

	let form = $state<ESignatureFormData>(eSignatureDefaultFormData);
	let fieldErrors = $state<Record<string, string>>({});
	let submitting = $state(false);

	$effect(() => {
		form = { ...initialData };
		fieldErrors = {};
		submitting = false;
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		fieldErrors = {};

		const result = eSignatureFormSchema.safeParse({
			...form,
			web: form.web || E_SIGNATURE_DEFAULT_WEB
		});

		if (!result.success) {
			const errors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const key = issue.path[0];
				if (typeof key === 'string' && !errors[key]) {
					errors[key] = issue.message;
				}
			}
			fieldErrors = errors;
			submitting = false;
			return;
		}

		onSubmit(result.data);
		submitting = false;
	}
</script>

<div class="card bg-base-100 shadow-sm max-w-2xl">
	<div class="card-body">
		<form onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Employee no.</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={form.employeeNo}
								class="input input-bordered w-full max-w-md"
								required
							/>
							{#if fieldErrors.employeeNo}
								<p class="mt-1 text-sm text-error">{fieldErrors.employeeNo}</p>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={form.name}
								class="input input-bordered w-full max-w-md"
								required
							/>
							{#if fieldErrors.name}
								<p class="mt-1 text-sm text-error">{fieldErrors.name}</p>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Designation</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={form.designation}
								class="input input-bordered w-full max-w-md"
								required
							/>
							{#if fieldErrors.designation}
								<p class="mt-1 text-sm text-error">{fieldErrors.designation}</p>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Department</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={form.department}
								class="input input-bordered w-full max-w-md"
								required
							/>
							{#if fieldErrors.department}
								<p class="mt-1 text-sm text-error">{fieldErrors.department}</p>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Email</td>
						<td class="form-table-field">
							<input
								type="email"
								bind:value={form.email}
								class="input input-bordered w-full max-w-md"
								required
							/>
							{#if fieldErrors.email}
								<p class="mt-1 text-sm text-error">{fieldErrors.email}</p>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Phone</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={form.phone}
								class="input input-bordered w-full max-w-md"
								required
							/>
							{#if fieldErrors.phone}
								<p class="mt-1 text-sm text-error">{fieldErrors.phone}</p>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Location</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={form.location}
								class="input input-bordered w-full max-w-md"
								required
							/>
							{#if fieldErrors.location}
								<p class="mt-1 text-sm text-error">{fieldErrors.location}</p>
							{/if}
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Web</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={form.web}
								class="input input-bordered w-full max-w-md"
								placeholder={E_SIGNATURE_DEFAULT_WEB}
							/>
							{#if fieldErrors.web}
								<p class="mt-1 text-sm text-error">{fieldErrors.web}</p>
							{/if}
						</td>
					</tr>
				</tbody>
			</table>
			<div class="form-actions">
				<button type="submit" class="btn btn-primary gap-2" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{/if}
					Preview signature
				</button>
			</div>
		</form>
	</div>
</div>
