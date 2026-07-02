<script lang="ts">
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import {
		APP_THEMES,
		type AppTheme,
		type PortalThemePolicy
	} from '$lib/constants/app-settings';
	import { SYSTEM_THEME_OPTION } from '$lib/constants/daisyui-themes';
	import {
		appSettings,
		initPortalThemePolicyFromServer,
		updateAppSettings
	} from '$lib/app-settings.svelte';
	import {
		getPortalThemeConfig,
		updatePortalThemeConfig
	} from '$lib/remotes/portal-theme-config.remote';

	let dialog = $state<HTMLDialogElement | null>(null);
	let allowedThemes = $state<AppTheme[]>([]);
	let defaultTheme = $state<AppTheme>(SYSTEM_THEME_OPTION);
	let loading = $state(false);
	let saving = $state(false);
	let error = $state<string | null>(null);

	const defaultThemeOptions = $derived(
		APP_THEMES.filter((option) => allowedThemes.includes(option.value))
	);

	function applyPolicy(policy: PortalThemePolicy) {
		allowedThemes = [...policy.allowedThemes];
		defaultTheme = policy.defaultTheme;
	}

	export async function open() {
		error = null;
		saving = false;
		loading = true;

		try {
			const policy = await getPortalThemeConfig();
			applyPolicy(policy);
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load theme policy';
		} finally {
			loading = false;
			dialog?.showModal();
		}
	}

	function close() {
		dialog?.close();
		error = null;
		saving = false;
		loading = false;
	}

	function resetForm() {
		error = null;
		saving = false;
		loading = false;
		allowedThemes = [];
		defaultTheme = SYSTEM_THEME_OPTION;
	}

	async function handleSubmit(event: SubmitEvent) {
		event.preventDefault();

		if (allowedThemes.length === 0) {
			error = 'Select at least one allowed theme.';
			return;
		}

		saving = true;
		error = null;

		try {
			const nextPolicy = await updatePortalThemeConfig({
				allowedThemes,
				defaultTheme
			});
			initPortalThemePolicyFromServer(nextPolicy);
			if (!nextPolicy.allowedThemes.includes(appSettings.theme)) {
				updateAppSettings({ theme: nextPolicy.defaultTheme });
			}
			close();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to save theme policy';
		} finally {
			saving = false;
		}
	}

	function toggleAllowedTheme(theme: AppTheme, checked: boolean) {
		if (checked) {
			allowedThemes = allowedThemes.includes(theme) ? allowedThemes : [...allowedThemes, theme];
			return;
		}

		allowedThemes = allowedThemes.filter((value) => value !== theme);
		if (allowedThemes.length > 0 && !allowedThemes.includes(defaultTheme)) {
			defaultTheme = allowedThemes[0];
		}
	}

	function selectAllThemes() {
		allowedThemes = APP_THEMES.map((option) => option.value);
	}

	function clearAllThemes() {
		allowedThemes = [];
	}
</script>

<dialog bind:this={dialog} class="modal" onclose={resetForm}>
	<div class="modal-box modal-box-fit">
		<h3 class="text-lg font-bold">Theme policy</h3>
		<p class="mt-1 text-sm text-base-content/70">
			Choose which DaisyUI themes users can pick. All 35 built-in themes plus System are available.
		</p>

		{#if loading}
			<div class="flex justify-center py-12">
				<LoadingSpinner />
			</div>
		{:else}
			<form class="mt-6" onsubmit={handleSubmit}>
				<table class="form-table">
					<tbody>
						<tr>
							<td class="form-table-label align-top">Allowed themes</td>
							<td class="form-table-field">
								<div class="mb-3 flex flex-wrap gap-2">
									<button type="button" class="btn btn-ghost btn-xs" onclick={selectAllThemes}>
										Select all
									</button>
									<button type="button" class="btn btn-ghost btn-xs" onclick={clearAllThemes}>
										Clear all
									</button>
								</div>
								<div class="flex max-h-64 flex-col gap-1 overflow-y-auto">
									{#each APP_THEMES as option (option.value)}
										<label
											class="label cursor-pointer justify-start gap-2 rounded-box border border-base-300 bg-base-200/50 px-2 py-1.5"
										>
											<input
												type="checkbox"
												class="checkbox checkbox-xs"
												checked={allowedThemes.includes(option.value)}
												onchange={(event) =>
													toggleAllowedTheme(option.value, event.currentTarget.checked)}
											/>
											<span class="label-text text-xs">{option.label}</span>
										</label>
									{/each}
								</div>
							</td>
						</tr>
						<tr>
							<td class="form-table-label">Default theme</td>
							<td class="form-table-field">
								<select
									class="select select-bordered w-full max-w-md"
									bind:value={defaultTheme}
									disabled={allowedThemes.length === 0}
								>
									{#each defaultThemeOptions as option (option.value)}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
								<p class="mt-1 text-xs text-base-content/60">
									For new visitors and when a saved theme is no longer allowed.
								</p>
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
					<button type="button" class="btn btn-ghost" onclick={close} disabled={saving}>
						Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={saving || allowedThemes.length === 0}
					>
						{#if saving}
							<LoadingSpinner size="sm" />
						{:else}
							Save theme policy
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
