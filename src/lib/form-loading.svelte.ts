import type { SubmitFunction } from '@sveltejs/kit';

export function createFormLoading() {
	let submitting = $state(false);

	const enhanceSubmit: SubmitFunction = () => {
		submitting = true;
		return async ({ update }) => {
			try {
				await update();
			} finally {
				submitting = false;
			}
		};
	};

	return {
		get submitting() {
			return submitting;
		},
		enhanceSubmit
	};
}
