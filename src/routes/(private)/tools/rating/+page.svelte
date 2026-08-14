<script lang="ts">
	import { ArrowLeft, Angry, Frown, Laugh, Meh, Smile, Star } from '@lucide/svelte';
	import PrivatePageHeader from '$lib/components/PrivatePageHeader.svelte';
	import LoadingCenter from '$lib/components/LoadingCenter.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import {
		DEPARTMENT_RATING_LABELS,
		DEPARTMENT_RATING_OPTIONS,
		type DepartmentRatingScore
	} from '$lib/constants/rating';
	import { withFormFeedback } from '$lib/form-feedback.svelte';
	import {
		getMyDepartmentRating,
		getRatingDepartments,
		saveDepartmentRating
	} from '$lib/remotes/rating.remote';

	const ratingIcons = {
		1: Angry,
		2: Frown,
		3: Meh,
		4: Smile,
		5: Laugh
	} as const;

	const ratingColors = {
		1: 'text-error',
		2: 'text-warning',
		3: 'text-base-content/60',
		4: 'text-success',
		5: 'text-primary'
	} as const;

	let selectedDepartmentId = $state('');
	let savingScore = $state<DepartmentRatingScore | null>(null);

	async function handleRate(score: DepartmentRatingScore, departmentName: string) {
		if (!selectedDepartmentId || savingScore !== null) return;

		savingScore = score;
		try {
			await withFormFeedback({
				successMessage: `Rated ${departmentName}: ${DEPARTMENT_RATING_LABELS[score]}`,
				action: async () =>
					saveDepartmentRating({
						departmentId: selectedDepartmentId,
						score
					})
			});
		} finally {
			savingScore = null;
		}
	}
</script>

<div class="mb-4">
	<a href="/tools" class="btn btn-ghost btn-sm gap-2">
		<ArrowLeft class="h-4 w-4" />
		Back to tools
	</a>
</div>

<PrivatePageHeader title="Department Rating" icon={Star} />

<p class="mb-6 text-base-content/70">
	Choose a department, then tap a reaction to save your rating.
</p>

<div class="card bg-base-100 shadow-sm max-w-2xl">
	<div class="card-body gap-6">
		<svelte:boundary>
			{@const departments = await getRatingDepartments()}

			<label class="form-control w-full max-w-md">
				<span class="label-text mb-1 font-medium">Department</span>
				<select class="select select-bordered w-full" bind:value={selectedDepartmentId}>
					<option value="" disabled>Select a department</option>
					{#each departments as dept (dept.id)}
						<option value={dept.id}>{dept.name}</option>
					{/each}
				</select>
			</label>

			{#if selectedDepartmentId}
				{@const selected = departments.find((d) => d.id === selectedDepartmentId)}
				{#if selected}
					{#key selectedDepartmentId}
						<svelte:boundary>
							{@const myRating = await getMyDepartmentRating(selectedDepartmentId)}
							{@const currentScore = (DEPARTMENT_RATING_OPTIONS.find(
								(o) => o.score === myRating.rating?.score
							)?.score ?? null) as DepartmentRatingScore | null}

							<div>
								<h2 class="text-xl font-bold">
									Rating: <span class="text-primary">{selected.name}</span>
								</h2>
								<p class="mt-1 text-sm text-base-content/60">
									{#if currentScore}
										Your current rating: {DEPARTMENT_RATING_LABELS[currentScore]}
									{:else}
										No rating yet — pick one below.
									{/if}
								</p>
							</div>

							<div class="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
								{#each DEPARTMENT_RATING_OPTIONS as option (option.score)}
									{@const Icon = ratingIcons[option.score]}
									{@const isActive = currentScore === option.score}
									{@const isSaving = savingScore === option.score}
									<button
										type="button"
										class="btn btn-square h-16 w-16 sm:h-20 sm:w-20"
										class:btn-primary={isActive}
										class:btn-outline={!isActive}
										disabled={savingScore !== null}
										aria-label={`Rate ${selected.name} as ${option.label}`}
										title={option.label}
										onclick={() => handleRate(option.score, selected.name)}
									>
										{#if isSaving}
											<LoadingSpinner size="sm" />
										{:else}
											<Icon
												class="h-8 w-8 sm:h-10 sm:w-10 {isActive
													? ''
													: ratingColors[option.score]}"
											/>
										{/if}
									</button>
								{/each}
							</div>

							<div class="flex flex-wrap justify-center gap-2 text-xs text-base-content/50">
								{#each DEPARTMENT_RATING_OPTIONS as option (option.score)}
									<span>{option.score}. {option.label}</span>
								{/each}
							</div>

							{#snippet pending()}
								<LoadingCenter />
							{/snippet}

							{#snippet failed(err)}
								<div class="alert alert-error">
									<span>
										{err instanceof Error ? err.message : 'Failed to load your rating'}
									</span>
								</div>
							{/snippet}
						</svelte:boundary>
					{/key}
				{/if}
			{:else}
				<p class="text-sm text-base-content/60">Select a department to start rating.</p>
			{/if}

			{#snippet pending()}
				<LoadingCenter />
			{/snippet}

			{#snippet failed(err)}
				<div class="alert alert-error">
					<span>
						{err instanceof Error ? err.message : 'Failed to load departments'}
					</span>
				</div>
			{/snippet}
		</svelte:boundary>
	</div>
</div>
