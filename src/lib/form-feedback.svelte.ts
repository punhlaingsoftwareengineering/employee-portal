import { isHttpError } from '@sveltejs/kit';
import { toast } from '$lib/toast.svelte';

export type LoadingStage = {
	label: string;
	percent: number;
};

const DEFAULT_STAGES: LoadingStage[] = [
	{ label: 'Preparing…', percent: 15 },
	{ label: 'Saving…', percent: 55 },
	{ label: 'Finishing…', percent: 85 }
];

let stageTimer: ReturnType<typeof setInterval> | null = null;

export const loadingProgress = $state({
	active: false,
	label: '',
	percent: 0
});

function clearStageTimer() {
	if (stageTimer) {
		clearInterval(stageTimer);
		stageTimer = null;
	}
}

export function startLoadingProgress(label = 'Working…', percent = 10) {
	clearStageTimer();
	loadingProgress.active = true;
	loadingProgress.label = label;
	loadingProgress.percent = percent;
}

export function setLoadingProgress(label: string, percent: number) {
	loadingProgress.active = true;
	loadingProgress.label = label;
	loadingProgress.percent = Math.max(0, Math.min(100, percent));
}

export function stopLoadingProgress() {
	clearStageTimer();
	loadingProgress.active = false;
	loadingProgress.label = '';
	loadingProgress.percent = 0;
}

/** Cycles through DaisyUI progress stages while an async form action runs. */
export function beginFormLoadingStages(stages: LoadingStage[] = DEFAULT_STAGES) {
	clearStageTimer();
	let index = 0;
	const first = stages[0] ?? { label: 'Working…', percent: 10 };
	loadingProgress.active = true;
	loadingProgress.label = first.label;
	loadingProgress.percent = first.percent;

	stageTimer = setInterval(() => {
		index = Math.min(index + 1, stages.length - 1);
		const stage = stages[index]!;
		loadingProgress.label = stage.label;
		loadingProgress.percent = stage.percent;
		if (index >= stages.length - 1) clearStageTimer();
	}, 450);
}

/** Prefer SvelteKit HttpError.body.message — HttpError is not an instanceof Error. */
export function getErrorMessage(err: unknown, fallback = 'Something went wrong'): string {
	if (typeof err === 'object' && err !== null) {
		const body = 'body' in err ? (err as { body?: unknown }).body : undefined;
		if (typeof body === 'object' && body !== null && 'message' in body) {
			const message = (body as { message?: unknown }).message;
			if (typeof message === 'string' && message.trim()) return message;
		}
		if (isHttpError(err)) {
			const message = err.body?.message;
			if (typeof message === 'string' && message.trim()) return message;
		}
		if (err instanceof Error && err.message.trim()) return err.message;
		if ('message' in err) {
			const message = (err as { message?: unknown }).message;
			if (typeof message === 'string' && message.trim()) return message;
		}
	}
	if (typeof err === 'string' && err.trim()) return err;
	return fallback;
}

export async function withFormFeedback<T>(options: {
	action: () => Promise<T>;
	successMessage: string;
	errorMessage?: string;
	stages?: LoadingStage[];
}): Promise<T> {
	beginFormLoadingStages(options.stages);
	try {
		const result = await options.action();
		setLoadingProgress('Done', 100);
		toast.success(options.successMessage);
		return result;
	} catch (err) {
		toast.error(getErrorMessage(err, options.errorMessage ?? 'Something went wrong'));
		throw err;
	} finally {
		await new Promise((resolve) => setTimeout(resolve, 180));
		stopLoadingProgress();
	}
}
