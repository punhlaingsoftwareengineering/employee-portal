export function createKeyedLoading() {
	let key = $state<string | null>(null);

	return {
		get pendingKey() {
			return key;
		},
		isPending(id: string) {
			return key === id;
		},
		async run(id: string, fn: () => Promise<void>) {
			if (key !== null) return;
			key = id;
			try {
				await fn();
			} finally {
				key = null;
			}
		}
	};
}
