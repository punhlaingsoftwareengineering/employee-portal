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
	import { getRoleCommunityLinkIds } from '$lib/remotes/community-link.remote';
	import type { CommunityLink } from '$lib/server/db/schema/community-link';
	import {
		getCommunityPlatformColorClass,
		getCommunityPlatformIcon
	} from '$lib/utils/community-platform';
	import ServiceIcon from '$lib/components/ServiceIcon.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';

	let {
		allServices = [],
		allApps = [],
		allCommunityLinks = []
	}: {
		allServices?: Service[];
		allApps?: App[];
		allCommunityLinks?: CommunityLink[];
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
	let selectedCommunityLinkIds = $state<string[]>([]);
	let submitting = $state(false);
	let opening = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingRole?.id));

	const allPermissionsSelected = $derived(
		employeeReadAll &&
			employeeWrite &&
			employeeDelete &&
			departmentReadAll &&
			departmentWrite &&
			facilityReadAll &&
			facilityWrite
	);

	const allNavSelected = $derived(
		navDashboard && navEmployees && navDepartments && navFacilities && navTools && navSettings
	);

	const allServicesSelected = $derived(
		allServices.length > 0 && allServices.every((item) => selectedServiceIds.includes(item.id))
	);

	const allAppsSelected = $derived(
		allApps.length > 0 && allApps.every((item) => selectedAppIds.includes(item.id))
	);

	const allCommunityLinksSelected = $derived(
		allCommunityLinks.length > 0 &&
			allCommunityLinks.every((item) => selectedCommunityLinkIds.includes(item.id))
	);

	const serviceRows = $derived(chunk(allServices, 3));
	const appRows = $derived(chunk(allApps, 3));
	const communityLinkRows = $derived(chunk(allCommunityLinks, 3));

	function chunk<T>(items: T[], size: number): T[][] {
		const rows: T[][] = [];
		for (let index = 0; index < items.length; index += size) {
			rows.push(items.slice(index, index + size));
		}
		return rows;
	}

	function padRow<T>(row: T[], size: number): (T | null)[] {
		const padded: (T | null)[] = [...row];
		while (padded.length < size) padded.push(null);
		return padded;
	}

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
			selectedCommunityLinkIds =
				existing?.id != null ? await getRoleCommunityLinkIds(existing.id) : [];
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
		selectedCommunityLinkIds = [];
	}

	function setAllPermissions(selected: boolean) {
		employeeReadAll = selected;
		employeeWrite = selected;
		employeeDelete = selected;
		departmentReadAll = selected;
		departmentWrite = selected;
		facilityReadAll = selected;
		facilityWrite = selected;
	}

	function setAllNav(selected: boolean) {
		navDashboard = selected;
		navEmployees = selected;
		navDepartments = selected;
		navFacilities = selected;
		navTools = selected;
		navSettings = selected;
	}

	function setAllServices(selected: boolean) {
		selectedServiceIds = selected ? allServices.map((item) => item.id) : [];
	}

	function setAllApps(selected: boolean) {
		selectedAppIds = selected ? allApps.map((item) => item.id) : [];
	}

	function setAllCommunityLinks(selected: boolean) {
		selectedCommunityLinkIds = selected ? allCommunityLinks.map((item) => item.id) : [];
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

	function toggleCommunityLink(linkId: string, checked: boolean) {
		if (checked) {
			if (!selectedCommunityLinkIds.includes(linkId)) {
				selectedCommunityLinkIds = [...selectedCommunityLinkIds, linkId];
			}
		} else {
			selectedCommunityLinkIds = selectedCommunityLinkIds.filter((id) => id !== linkId);
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
				appIds: selectedAppIds,
				communityLinkIds: selectedCommunityLinkIds
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
	<div class="modal-box modal-box-fit role-dialog-box">
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

				<table class="role-dialog-section-table mt-6">
					<thead>
						<tr>
							<th colspan="3">
								<div class="role-dialog-section-header">
									<span class="font-semibold">Permissions</span>
									<label class="role-dialog-select-all">
										<span>Select all</span>
										<input
											type="checkbox"
											class="checkbox checkbox-sm"
											checked={allPermissionsSelected}
											onchange={(event) =>
												setAllPermissions((event.currentTarget as HTMLInputElement).checked)}
										/>
									</label>
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={employeeReadAll} />
									<span>Read employees in all departments</span>
								</label>
							</td>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={employeeWrite} />
									<span>Create / update employees (assigned departments)</span>
								</label>
							</td>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={employeeDelete} />
									<span>Delete employees (assigned departments)</span>
								</label>
							</td>
						</tr>
						<tr>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={departmentReadAll} />
									<span>Read all departments</span>
								</label>
							</td>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={departmentWrite} />
									<span>Manage departments</span>
								</label>
							</td>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={facilityReadAll} />
									<span>Read all facilities</span>
								</label>
							</td>
						</tr>
						<tr>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={facilityWrite} />
									<span>Manage facilities</span>
								</label>
							</td>
							<td></td>
							<td></td>
						</tr>
					</tbody>
				</table>

				<table class="role-dialog-section-table mt-6">
					<thead>
						<tr>
							<th colspan="3">
								<div class="role-dialog-section-header">
									<div>
										<span class="font-semibold">Sidebar navigation</span>
										<p class="mt-1 text-xs font-normal text-base-content/60">
											Controls which sidebar buttons this role grants. Users still need matching
											permissions / tool assignment to access pages.
										</p>
									</div>
									<label class="role-dialog-select-all shrink-0">
										<span>Select all</span>
										<input
											type="checkbox"
											class="checkbox checkbox-sm"
											checked={allNavSelected}
											onchange={(event) =>
												setAllNav((event.currentTarget as HTMLInputElement).checked)}
										/>
									</label>
								</div>
							</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={navDashboard} />
									<span>Dashboard</span>
								</label>
							</td>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={navEmployees} />
									<span>Employees</span>
								</label>
							</td>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={navDepartments} />
									<span>Departments</span>
								</label>
							</td>
						</tr>
						<tr>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={navFacilities} />
									<span>Facilities</span>
								</label>
							</td>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={navTools} />
									<span>Tools</span>
								</label>
							</td>
							<td>
								<label class="role-dialog-checkbox">
									<input type="checkbox" class="checkbox checkbox-sm" bind:checked={navSettings} />
									<span>Settings</span>
								</label>
							</td>
						</tr>
					</tbody>
				</table>

				<div class="mt-6">
					<h4 class="font-semibold">Available tools</h4>
					<p class="mt-1 text-sm text-base-content/60">
						Assign services and apps this role can access from the Tools page.
					</p>

					<table class="role-dialog-section-table mt-4">
						<thead>
							<tr>
								<th colspan="3">
									<div class="role-dialog-section-header">
										<span class="text-sm font-medium text-base-content/80">Services</span>
										{#if allServices.length > 0}
											<label class="role-dialog-select-all">
												<span>Select all</span>
												<input
													type="checkbox"
													class="checkbox checkbox-sm"
													checked={allServicesSelected}
													onchange={(event) =>
														setAllServices((event.currentTarget as HTMLInputElement).checked)}
												/>
											</label>
										{/if}
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{#if allServices.length === 0}
								<tr>
									<td colspan="3" class="text-sm text-base-content/60">No services registered yet.</td>
								</tr>
							{:else}
								{#each serviceRows as row, rowIndex (rowIndex)}
									<tr>
										{#each padRow(row, 3) as item (item?.id ?? `empty-${rowIndex}`)}
											<td>
												{#if item}
													<label class="role-dialog-checkbox">
														<input
															type="checkbox"
															class="checkbox checkbox-sm"
															checked={selectedServiceIds.includes(item.id)}
															onchange={(event) =>
																toggleService(
																	item.id,
																	(event.currentTarget as HTMLInputElement).checked
																)}
														/>
														<span class="flex items-center gap-2">
															<ServiceIcon
																iconUrl={item.iconUrl}
																name={item.name}
																class="h-4 w-4 shrink-0"
															/>
															{item.name}
														</span>
													</label>
												{/if}
											</td>
										{/each}
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>

					<table class="role-dialog-section-table mt-4">
						<thead>
							<tr>
								<th colspan="3">
									<div class="role-dialog-section-header">
										<span class="text-sm font-medium text-base-content/80">Apps</span>
										{#if allApps.length > 0}
											<label class="role-dialog-select-all">
												<span>Select all</span>
												<input
													type="checkbox"
													class="checkbox checkbox-sm"
													checked={allAppsSelected}
													onchange={(event) =>
														setAllApps((event.currentTarget as HTMLInputElement).checked)}
												/>
											</label>
										{/if}
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{#if allApps.length === 0}
								<tr>
									<td colspan="3" class="text-sm text-base-content/60">No apps registered yet.</td>
								</tr>
							{:else}
								{#each appRows as row, rowIndex (rowIndex)}
									<tr>
										{#each padRow(row, 3) as item (item?.id ?? `empty-${rowIndex}`)}
											<td>
												{#if item}
													<label class="role-dialog-checkbox">
														<input
															type="checkbox"
															class="checkbox checkbox-sm"
															checked={selectedAppIds.includes(item.id)}
															onchange={(event) =>
																toggleApp(
																	item.id,
																	(event.currentTarget as HTMLInputElement).checked
																)}
														/>
														<span class="flex items-center gap-2">
															<ServiceIcon
																iconUrl={item.iconUrl}
																name={item.name}
																class="h-4 w-4 shrink-0"
															/>
															{item.name}
														</span>
													</label>
												{/if}
											</td>
										{/each}
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>

					<table class="role-dialog-section-table mt-4">
						<thead>
							<tr>
								<th colspan="3">
									<div class="role-dialog-section-header">
										<span class="text-sm font-medium text-base-content/80">Community links</span>
										{#if allCommunityLinks.length > 0}
											<label class="role-dialog-select-all">
												<span>Select all</span>
												<input
													type="checkbox"
													class="checkbox checkbox-sm"
													checked={allCommunityLinksSelected}
													onchange={(event) =>
														setAllCommunityLinks(
															(event.currentTarget as HTMLInputElement).checked
														)}
												/>
											</label>
										{/if}
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{#if allCommunityLinks.length === 0}
								<tr>
									<td colspan="3" class="text-sm text-base-content/60">
										No community links yet.
									</td>
								</tr>
							{:else}
								{#each communityLinkRows as row, rowIndex (rowIndex)}
									<tr>
										{#each padRow(row, 3) as item, colIndex (item?.id ?? `empty-community-${rowIndex}-${colIndex}`)}
											<td>
												{#if item}
													{@const LinkIcon = getCommunityPlatformIcon(item.platform)}
													<label class="role-dialog-checkbox">
														<input
															type="checkbox"
															class="checkbox checkbox-sm"
															checked={selectedCommunityLinkIds.includes(item.id)}
															onchange={(event) =>
																toggleCommunityLink(
																	item.id,
																	(event.currentTarget as HTMLInputElement).checked
																)}
														/>
														<span class="flex items-center gap-2">
															<span
																class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white {getCommunityPlatformColorClass(item.platform)}"
															>
																<LinkIcon class="h-3 w-3" />
															</span>
															<span class="min-w-0">
																<span class="block truncate">{item.title}</span>
																{#if !item.isPublic}
																	<span class="text-xs text-base-content/60">Role only</span>
																{/if}
															</span>
														</span>
													</label>
												{/if}
											</td>
										{/each}
									</tr>
								{/each}
							{/if}
						</tbody>
					</table>
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

<style>
	.role-dialog-box {
		min-width: min(52rem, calc(100vw - 2rem));
	}

	.role-dialog-section-table {
		width: 100%;
		border-collapse: collapse;
	}

	.role-dialog-section-table :is(thead, tbody, tr, td, th) {
		background: transparent;
	}

	.role-dialog-section-table th {
		padding: 0 0 0.5rem;
		text-align: left;
		font-weight: inherit;
		vertical-align: top;
	}

	.role-dialog-section-table td {
		width: 33.333%;
		padding: 0.35rem 0.75rem 0.35rem 0;
		vertical-align: top;
	}

	.role-dialog-section-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.role-dialog-select-all {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.75rem;
		font-weight: 500;
		color: color-mix(in oklab, var(--color-base-content) 70%, transparent);
	}

	.role-dialog-checkbox {
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		cursor: pointer;
		font-size: 0.875rem;
		line-height: 1.35;
	}
</style>
