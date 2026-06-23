<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { AccessRole } from '$lib/server/db/schema/access-role';
	import type { Service } from '$lib/server/db/schema/service';
	import type { App } from '$lib/server/db/schema/app';
	import {
		createAccessRole,
		updateAccessRole,
		getAccessRoles
	} from '$lib/remotes/access-role.remote';
	import { getRoleServiceIds } from '$lib/remotes/service.remote';
	import { getRoleAppIds } from '$lib/remotes/app.remote';
	import ServiceIcon from '$lib/components/ServiceIcon.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';

	let {
		allServices = [],
		allApps = []
	}: {
		allServices?: Service[];
		allApps?: App[];
	} = $props();

	let dialog = $state<HTMLDialogElement | null>(null);
	let editingRole = $state<AccessRole | null>(null);
	let name = $state('');
	let slug = $state('');
	let description = $state('');
	let employeeReadAll = $state(false);
	let employeeWrite = $state(false);
	let employeeDelete = $state(false);
	let departmentReadAll = $state(false);
	let departmentWrite = $state(false);
	let facilityReadAll = $state(false);
	let facilityWrite = $state(false);
	let navDashboard = $state(true);
	let navEmployees = $state(true);
	let navDepartments = $state(true);
	let navFacilities = $state(true);
	let navTools = $state(true);
	let navSettings = $state(false);
	let selectedServiceIds = $state<string[]>([]);
	let selectedAppIds = $state<string[]>([]);
	let submitting = $state(false);
	let opening = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingRole?.id));

	export async function open(existing?: (AccessRole & { serviceCount?: number; appCount?: number }) | null) {
		editingRole = existing ?? null;
		error = null;
		opening = true;
		dialog?.showModal();

		try {
			name = existing?.name ?? '';
			slug = existing?.slug ?? '';
			description = existing?.description ?? '';
			navDashboard = existing?.navDashboard ?? true;
			navEmployees = existing?.navEmployees ?? true;
			navDepartments = existing?.navDepartments ?? true;
			navFacilities = existing?.navFacilities ?? true;
			navTools = existing?.navTools ?? true;
			navSettings = existing?.navSettings ?? false;
			employeeReadAll = existing?.employeeReadAll ?? false;
			employeeWrite = existing?.employeeWrite ?? false;
			employeeDelete = existing?.employeeDelete ?? false;
			departmentReadAll = existing?.departmentReadAll ?? false;
			departmentWrite = existing?.departmentWrite ?? false;
			facilityReadAll = existing?.facilityReadAll ?? false;
			facilityWrite = existing?.facilityWrite ?? false;
			selectedServiceIds =
				existing?.id != null ? await getRoleServiceIds(existing.id) : [];
			selectedAppIds = existing?.id != null ? await getRoleAppIds(existing.id) : [];
		} finally {
			opening = false;
		}
	}

	function close() {
		dialog?.close();
		editingRole = null;
		error = null;
		submitting = false;
		opening = false;
		selectedServiceIds = [];
		selectedAppIds = [];
	}

	function toggleService(serviceId: string, checked: boolean) {
		if (checked) {
			if (!selectedServiceIds.includes(serviceId)) {
				selectedServiceIds = [...selectedServiceIds, serviceId];
			}
		} else {
			selectedServiceIds = selectedServiceIds.filter((id) => id !== serviceId);
		}
	}

	function toggleApp(appId: string, checked: boolean) {
		if (checked) {
			if (!selectedAppIds.includes(appId)) {
				selectedAppIds = [...selectedAppIds, appId];
			}
		} else {
			selectedAppIds = selectedAppIds.filter((id) => id !== appId);
		}
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		submitting = true;
		error = null;

		try {
			const payload = {
				name: name.trim(),
				slug: slug.trim(),
				description: description.trim() || undefined,
				navDashboard,
				navEmployees,
				navDepartments,
				navFacilities,
				navTools,
				navSettings,
				employeeReadAll,
				employeeWrite,
				employeeDelete,
				departmentReadAll,
				departmentWrite,
				facilityReadAll,
				facilityWrite,
				serviceIds: selectedServiceIds,
				appIds: selectedAppIds
			};

			if (editingRole?.id) {
				await updateAccessRole({ id: editingRole.id, ...payload });
			} else {
				await createAccessRole(payload);
			}

			void getAccessRoles().refresh();
			await invalidateAll();
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save role';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box max-w-2xl">
		<h3 class="text-lg font-bold">{isEdit ? 'Edit role' : 'New role'}</h3>

		{#if opening}
			<LoadingCenter class="py-12" />
		{:else}
		<form class="mt-6" onsubmit={handleSubmit}>
			<table class="form-table">
				<tbody>
					<tr>
						<td class="form-table-label">Name</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={name}
								class="input input-bordered w-full max-w-md"
								required
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Slug</td>
						<td class="form-table-field">
							<input
								type="text"
								bind:value={slug}
								class="input input-bordered w-full max-w-md"
								required
								disabled={editingRole?.isSystem}
							/>
						</td>
					</tr>
					<tr>
						<td class="form-table-label">Description</td>
						<td class="form-table-field">
							<textarea
								bind:value={description}
								class="textarea textarea-bordered w-full max-w-md"
								rows="2"
							></textarea>
						</td>
					</tr>
				</tbody>
			</table>

			<div class="mt-6 space-y-2">
				<h4 class="font-semibold">Permissions</h4>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={employeeReadAll} />
					<span class="label-text">Read employees in all departments</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={employeeWrite} />
					<span class="label-text">Create / update employees (assigned departments)</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={employeeDelete} />
					<span class="label-text">Delete employees (assigned departments)</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={departmentReadAll} />
					<span class="label-text">Read all departments</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={departmentWrite} />
					<span class="label-text">Manage departments</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={facilityReadAll} />
					<span class="label-text">Read all facilities</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={facilityWrite} />
					<span class="label-text">Manage facilities</span>
				</label>
			</div>

			<div class="mt-6 space-y-2">
				<h4 class="font-semibold">Sidebar navigation</h4>
				<p class="text-sm text-base-content/60">
					These toggles control which sidebar buttons this role grants. Users still need the matching
					permissions / tool assignment to access pages.
				</p>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={navDashboard} />
					<span class="label-text">Dashboard</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={navEmployees} />
					<span class="label-text">Employees</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={navDepartments} />
					<span class="label-text">Departments</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={navFacilities} />
					<span class="label-text">Facilities</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={navTools} />
					<span class="label-text">Tools</span>
				</label>
				<label class="label cursor-pointer justify-start gap-3">
					<input type="checkbox" class="checkbox" bind:checked={navSettings} />
					<span class="label-text">Settings</span>
				</label>
			</div>

			<div class="mt-6 space-y-4">
				<h4 class="font-semibold">Available tools</h4>
				<p class="text-sm text-base-content/60">
					Assign services and apps this role can access from the Tools page.
				</p>

				<div class="space-y-2">
					<h5 class="text-sm font-medium text-base-content/80">Services</h5>
					{#if allServices.length === 0}
						<p class="text-sm text-base-content/60">No services registered yet.</p>
					{:else}
						{#each allServices as item (item.id)}
							<label class="label cursor-pointer justify-start gap-3">
								<input
									type="checkbox"
									class="checkbox"
									checked={selectedServiceIds.includes(item.id)}
									onchange={(event) =>
										toggleService(item.id, (event.currentTarget as HTMLInputElement).checked)}
								/>
								<span class="label-text flex items-center gap-2">
									<ServiceIcon iconUrl={item.iconUrl} name={item.name} class="h-4 w-4" />
									{item.name}
								</span>
							</label>
						{/each}
					{/if}
				</div>

				<div class="space-y-2">
					<h5 class="text-sm font-medium text-base-content/80">Apps</h5>
					{#if allApps.length === 0}
						<p class="text-sm text-base-content/60">No apps registered yet.</p>
					{:else}
						{#each allApps as item (item.id)}
							<label class="label cursor-pointer justify-start gap-3">
								<input
									type="checkbox"
									class="checkbox"
									checked={selectedAppIds.includes(item.id)}
									onchange={(event) =>
										toggleApp(item.id, (event.currentTarget as HTMLInputElement).checked)}
								/>
								<span class="label-text flex items-center gap-2">
									<ServiceIcon iconUrl={item.iconUrl} name={item.name} class="h-4 w-4" />
									{item.name}
								</span>
							</label>
						{/each}
					{/if}
				</div>
			</div>

			{#if error}
				<div class="alert alert-error mt-4">
					<span>{error}</span>
				</div>
			{/if}

			<div class="modal-action">
				<button type="button" class="btn btn-ghost" onclick={close} disabled={submitting}
					>Cancel</button
				>
				<button type="submit" class="btn btn-primary" disabled={submitting}>
					{#if submitting}
						<LoadingSpinner size="sm" />
					{:else}
						{isEdit ? 'Save role' : 'Create role'}
					{/if}
				</button>
			</div>
		</form>
		{/if}
	</div>
	<form method="dialog" class="modal-backdrop">
		<button aria-label="Close dialog">close</button>
	</form>
</dialog>
