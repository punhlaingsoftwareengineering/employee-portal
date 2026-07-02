function asErr(error: unknown): { code?: string; message?: string; cause?: unknown } | null {
	return error && typeof error === 'object' ? (error as { code?: string; message?: string; cause?: unknown }) : null;
}

function walkErrors(error: unknown, visit: (err: { code?: string; message?: string }) => boolean): boolean {
	const err = asErr(error);
	if (!err) return false;
	if (visit(err)) return true;
	return err.cause ? walkErrors(err.cause, visit) : false;
}

/** True when Postgres reports a missing table/relation (e.g. schema not yet pushed). */
export function isMissingRelationError(error: unknown): boolean {
	return walkErrors(error, (err) => {
		if (err.code === '42P01') return true;
		return typeof err.message === 'string' && /relation .+ does not exist/i.test(err.message);
	});
}

/** True when the app cannot reach Postgres (bad URL, network, DNS, auth). */
export function isDbConnectionError(error: unknown): boolean {
	return walkErrors(error, (err) => {
		if (typeof err.code === 'string' && /^(ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|28P01|08001)$/.test(err.code)) {
			return true;
		}
		if (typeof err.message !== 'string') return false;
		return /(ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ETIMEDOUT|password authentication failed|getaddrinfo|connect ECONNREFUSED)/i.test(
			err.message
		);
	});
}

export function isOptionalFeatureDbError(error: unknown): boolean {
	return isMissingRelationError(error) || isDbConnectionError(error);
}
