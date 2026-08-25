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
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import {
		emptyPermissionFlags,
		type AccessRolePermissionFlags,
		type AccessRolePermissionKey
	} from '$lib/constants/access-role-permissions';

	type FlagOption = { key: AccessRolePermissionKey; label: string };
	type FlagSection = { title: string; hint?: string; flags: FlagOption[] };

	const NAV_DEFAULTS: Partial<AccessRolePermissionFlags> = {
		navDashboard: true,
		navEmployees: true,
		navDepartments: true,
		navFacilities: true,
		navPharmacy: true,
		navDoctors: true,
		navTools: true
	};

	const FLAG_SECTIONS: FlagSection[] = [
		{
			title: 'Sidebar navigation',
			hint: 'Controls which sidebar buttons this role grants. Users still need matching permissions / tool assignment to access pages.',
			flags: [
				{ key: 'navDashboard', label: 'Dashboard' },
				{ key: 'navEmployees', label: 'Employees' },
				{ key: 'navDepartments', label: 'Departments' },
				{ key: 'navFacilities', label: 'Facilities' },
				{ key: 'navPharmacy', label: 'Pharmacy' },
				{ key: 'navDoctors', label: 'Doctors' },
				{ key: 'navTools', label: 'Tools' },
				{ key: 'navSettings', label: 'Settings' },
				{ key: 'navCommunity', label: 'Community' },
				{ key: 'navUsers', label: 'Users' },
				{ key: 'navRoles', label: 'Roles' }
			]
		},
		{
			title: 'Employees',
			flags: [
				{ key: 'employeeReadAll', label: 'View all departments' },
				{ key: 'employeeCreate', label: 'Manual add' },
				{ key: 'employeeUpdate', label: 'Edit row' },
				{ key: 'employeeDelete', label: 'Delete' },
				{ key: 'employeeExcelOverride', label: 'Excel override' },
				{ key: 'employeeExport', label: 'Export' }
			]
		},
		{
			title: 'Doctors',
			flags: [
				{ key: 'doctorReadAll', label: 'View table' },
				{ key: 'doctorCreate', label: 'Manual add' },
				{ key: 'doctorUpdate', label: 'Edit row' },
				{ key: 'doctorDelete', label: 'Delete' },
				{ key: 'doctorExcelOverride', label: 'Excel override' },
				{ key: 'doctorExport', label: 'Export' }
			]
		},
		{
			title: 'Pharmacy',
			flags: [
				{ key: 'pharmacyReadAll', label: 'View table' },
				{ key: 'pharmacyCreate', label: 'Manual add' },
				{ key: 'pharmacyUpdate', label: 'Edit row' },
				{ key: 'pharmacyDelete', label: 'Delete' },
				{ key: 'pharmacyExcelOverride', label: 'Excel override' },
				{ key: 'pharmacyExport', label: 'Export' }
			]
		},
		{
			title: 'Departments',
			flags: [
				{ key: 'departmentReadAll', label: 'View all' },
				{ key: 'departmentCreate', label: 'Manual add' },
				{ key: 'departmentUpdate', label: 'Edit (assigned)' },
				{ key: 'departmentDelete', label: 'Delete (assigned)' }
			]
		},
		{
			title: 'Facilities',
			flags: [
				{ key: 'facilityReadAll', label: 'View all' },
				{ key: 'facilityCreate', label: 'Manual add' },
				{ key: 'facilityUpdate', label: 'Edit (assigned)' },
				{ key: 'facilityDelete', label: 'Delete (assigned)' }
			]
		},
		{
			title: 'Users',
			flags: [
				{ key: 'usersRead', label: 'View table' },
				{ key: 'usersInvite', label: 'Invite user' },
				{ key: 'usersUpdate', label: 'Edit access' },
				{ key: 'usersInviteResend', label: 'Resend invite' },
				{ key: 'usersInviteRevoke', label: 'Revoke invite' }
			]
		},
		{
			title: 'Roles',
			flags: [
				{ key: 'rolesRead', label: 'View table' },
				{ key: 'rolesCreate', label: 'Create role' },
				{ key: 'rolesUpdate', label: 'Edit role' },
				{ key: 'rolesDelete', label: 'Delete role' }
			]
		},
		{
			title: 'Community',
			flags: [
				{ key: 'communityCategoryCreate', label: 'Add category' },
				{ key: 'communityCategoryUpdate', label: 'Edit category' },
				{ key: 'communityCategoryDelete', label: 'Delete category' },
				{ key: 'communityLinkCreate', label: 'Add link' },
				{ key: 'communityLinkUpdate', label: 'Edit link' },
				{ key: 'communityLinkDelete', label: 'Delete link' }
			]
		},
		{
			title: 'Settings',
			flags: [
				{ key: 'settingsThemeUpdate', label: 'Theme / font policies' },
				{ key: 'settingsNewsletterCreate', label: 'Newsletter add' },
				{ key: 'settingsNewsletterUpdate', label: 'Newsletter edit' },
				{ key: 'settingsNewsletterDelete', label: 'Newsletter delete' },
				{ key: 'settingsOnboardingCreate', label: 'Onboarding add' },
				{ key: 'settingsOnboardingUpdate', label: 'Onboarding edit' },
				{ key: 'settingsOnboardingDelete', label: 'Onboarding delete' },
				{ key: 'settingsAnnouncementCreate', label: 'Announcement add' },
				{ key: 'settingsAnnouncementUpdate', label: 'Announcement edit' },
				{ key: 'settingsAnnouncementDelete', label: 'Announcement delete' },
				{ key: 'settingsSoundCreate', label: 'Sound add' },
				{ key: 'settingsSoundUpdate', label: 'Sound edit' },
				{ key: 'settingsSoundDelete', label: 'Sound delete' },
				{ key: 'settingsNotificationCreate', label: 'Notification add' },
				{ key: 'settingsNotificationUpdate', label: 'Notification edit' },
				{ key: 'settingsNotificationDelete', label: 'Notification delete' }
			]
		},
		{
			title: 'Tools manage',
			flags: [
				{ key: 'toolsServiceCreate', label: 'Service add' },
				{ key: 'toolsServiceUpdate', label: 'Service edit' },
				{ key: 'toolsServiceDelete', label: 'Service delete' },
				{ key: 'toolsAppCreate', label: 'App add' },
				{ key: 'toolsAppUpdate', label: 'App edit' },
				{ key: 'toolsAppDelete', label: 'App delete' },
				{ key: 'toolsGuideCreate', label: 'Guide add' },
				{ key: 'toolsGuideUpdate', label: 'Guide edit' },
				{ key: 'toolsGuideDelete', label: 'Guide delete' },
				{ key: 'toolsLearningCreate', label: 'Learning add' },
				{ key: 'toolsLearningUpdate', label: 'Learning edit' },
				{ key: 'toolsLearningDelete', label: 'Learning delete' }
			]
		}
	];

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
	let description = $state('');
	let flags = $state<AccessRolePermissionFlags>(emptyPermissionFlags(NAV_DEFAULTS));
	let selectedServiceIds = $state<string[]>([]);
	let selectedAppIds = $state<string[]>([]);
	let selectedCommunityLinkIds = $state<string[]>([]);
	let submitting = $state(false);
	let opening = $state(false);
	let error = $state<string | null>(null);

	const isEdit = $derived(Boolean(editingRole?.id));

	const assignableServices = $derived(allServices.filter((item) => !item.isPublic));
	const assignableApps = $derived(allApps.filter((item) => !item.isPublic));

	const allServicesSelected = $derived(
		assignableServices.length > 0 &&
			assignableServices.every((item) => selectedServiceIds.includes(item.id))
	);

	const allAppsSelected = $derived(
		assignableApps.length > 0 && assignableApps.every((item) => selectedAppIds.includes(item.id))
	);

	const allCommunityLinksSelected = $derived(
		allCommunityLinks.length > 0 &&
			allCommunityLinks.every((item) => selectedCommunityLinkIds.includes(item.id))
	);

	const serviceRows = $derived(chunk(assignableServices, 3));
	const appRows = $derived(chunk(assignableApps, 3));
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

	function sectionSelected(section: FlagSection): boolean {
		return section.flags.every((flag) => flags[flag.key]);
	}

	function setSection(section: FlagSection, selected: boolean) {
		const next = { ...flags };
		for (const flag of section.flags) {
			next[flag.key] = selected;
		}
		flags = next;
	}

	function setFlag(key: AccessRolePermissionKey, checked: boolean) {
		flags = { ...flags, [key]: checked };
	}

	function pickExistingFlags(existing: AccessRole): AccessRolePermissionFlags {
		const picked: Partial<AccessRolePermissionFlags> = {};
		for (const section of FLAG_SECTIONS) {
			for (const flag of section.flags) {
				picked[flag.key] = Boolean(existing[flag.key]);
			}
		}
		return emptyPermissionFlags(picked);
	}

	export async function open(
		existing?: (AccessRole & { serviceCount?: number; appCount?: number }) | null
	) {
		editingRole = existing ?? null;
		error = null;
		opening = true;
		dialog?.showModal();

		try {
			name = existing?.name ?? '';
			description = existing?.description ?? '';
			flags = existing ? pickExistingFlags(existing) : emptyPermissionFlags(NAV_DEFAULTS);
			const assignableServiceIds = new Set(allServices.filter((s) => !s.isPublic).map((s) => s.id));
			const assignableAppIds = new Set(allApps.filter((a) => !a.isPublic).map((a) => a.id));
			selectedServiceIds =
				existing?.id != null
					? (await getRoleServiceIds(existing.id)).filter((id) => assignableServiceIds.has(id))
					: [];
			selectedAppIds =
				existing?.id != null
					? (await getRoleAppIds(existing.id)).filter((id) => assignableAppIds.has(id))
					: [];
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

	function setAllServices(selected: boolean) {
		selectedServiceIds = selected ? assignableServices.map((item) => item.id) : [];
	}

	function setAllApps(selected: boolean) {
		selectedAppIds = selected ? assignableApps.map((item) => item.id) : [];
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
			await withFormFeedback({
				successMessage: isEdit
					? 'Role updated. Assigned users must sign in again for the new access to apply.'
					: 'Role created',
				action: async () => {
					const payload = {
						name: name.trim(),
						description: description.trim() || undefined,
						...flags,
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
				}
			});
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save role';
		} finally {
			submitting = false;
		}
	}
</script>

<dialog bind:this={dialog} class="modal">
	<div class="modal-box-fit role-dialog-box modal-box">
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
									class="input-bordered input w-full max-w-md cursor-text"
									required
								/>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Description</td>
							<td class="form-table-field">
								<textarea
									bind:value={description}
									class="textarea-bordered textarea w-full max-w-md cursor-text"
									rows="2"></textarea>
							</td>
						</tr>
					</tbody>
				</table>

				{#each FLAG_SECTIONS as section (section.title)}
					<table class="role-dialog-section-table mt-6">
						<thead>
							<tr>
								<th colspan="3">
									<div class="role-dialog-section-header">
										<div>
											<span class="font-semibold">{section.title}</span>
											{#if section.hint}
												<p class="mt-1 text-xs font-normal text-base-content/60">{section.hint}</p>
											{/if}
										</div>
										<label class="role-dialog-select-all shrink-0">
											<span>Select all</span>
											<input
												type="checkbox"
												class="checkbox cursor-pointer checkbox-sm"
												checked={sectionSelected(section)}
												onchange={(event) =>
													setSection(section, (event.currentTarget as HTMLInputElement).checked)}
											/>
										</label>
									</div>
								</th>
							</tr>
						</thead>
						<tbody>
							{#each chunk(section.flags, 3) as row, rowIndex (rowIndex)}
								<tr>
									{#each padRow(row, 3) as item, colIndex (item?.key ?? `empty-${section.title}-${rowIndex}-${colIndex}`)}
										<td>
											{#if item}
												<label class="role-dialog-checkbox">
													<input
														type="checkbox"
														class="checkbox cursor-pointer checkbox-sm"
														checked={flags[item.key]}
														onchange={(event) =>
															setFlag(item.key, (event.currentTarget as HTMLInputElement).checked)}
													/>
													<span>{item.label}</span>
												</label>
											{/if}
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				{/each}

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
										{#if assignableServices.length > 0}
											<label class="role-dialog-select-all">
												<span>Select all</span>
												<input
													type="checkbox"
													class="checkbox cursor-pointer checkbox-sm"
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
							{#if assignableServices.length === 0}
								<tr>
									<td colspan="3" class="text-sm text-base-content/60">
										No role-gated services yet. Public services are available to everyone.
									</td>
								</tr>
							{:else}
								{#each serviceRows as row, rowIndex (rowIndex)}
									<tr>
										{#each padRow(row, 3) as item, colIndex (item?.id ?? `empty-service-${rowIndex}-${colIndex}`)}
											<td>
												{#if item}
													<label class="role-dialog-checkbox">
														<input
															type="checkbox"
															class="checkbox cursor-pointer checkbox-sm"
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
										{#if assignableApps.length > 0}
											<label class="role-dialog-select-all">
												<span>Select all</span>
												<input
													type="checkbox"
													class="checkbox cursor-pointer checkbox-sm"
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
							{#if assignableApps.length === 0}
								<tr>
									<td colspan="3" class="text-sm text-base-content/60">
										No role-gated apps yet. Public apps are available to everyone.
									</td>
								</tr>
							{:else}
								{#each appRows as row, rowIndex (rowIndex)}
									<tr>
										{#each padRow(row, 3) as item, colIndex (item?.id ?? `empty-app-${rowIndex}-${colIndex}`)}
											<td>
												{#if item}
													<label class="role-dialog-checkbox">
														<input
															type="checkbox"
															class="checkbox cursor-pointer checkbox-sm"
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
													class="checkbox cursor-pointer checkbox-sm"
													checked={allCommunityLinksSelected}
													onchange={(event) =>
														setAllCommunityLinks((event.currentTarget as HTMLInputElement).checked)}
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
									<td colspan="3" class="text-sm text-base-content/60">No community links yet.</td>
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
															class="checkbox cursor-pointer checkbox-sm"
															checked={selectedCommunityLinkIds.includes(item.id)}
															onchange={(event) =>
																toggleCommunityLink(
																	item.id,
																	(event.currentTarget as HTMLInputElement).checked
																)}
														/>
														<span class="flex items-center gap-2">
															<span
																class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white {getCommunityPlatformColorClass(
																	item.platform
																)}"
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
					<div class="mt-4 alert alert-error">
						<span>{error}</span>
					</div>
				{/if}

				<div class="modal-action">
					<button
						type="button"
						class="btn cursor-pointer btn-ghost"
						onclick={close}
						disabled={submitting}>Cancel</button
					>
					<button type="submit" class="btn cursor-pointer btn-primary" disabled={submitting}>
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
