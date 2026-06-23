export const SERVICE_EMBED_MODES = [
	{ value: 'direct', label: 'Direct iframe' },
	{ value: 'proxy', label: 'Proxy (LAN apps)' },
	{ value: 'external', label: 'Open externally' }
] as const;

export type ServiceEmbedMode = (typeof SERVICE_EMBED_MODES)[number]['value'];

export const SERVICE_EMBED_MODE_HELP: Record<ServiceEmbedMode, string> = {
	direct: 'Load the service URL directly in the frame. Best for public HTTPS sites that allow embedding.',
	proxy:
		'Route through the portal server. Use for private LAN apps (n8n, Grafana) on different network addresses.',
	external: 'No iframe — show a launch button that opens the service in a new tab.'
};

export function suggestEmbedMode(_link: string): ServiceEmbedMode {
	return 'external';
}

export function embedModeLabel(mode: ServiceEmbedMode): string {
	return SERVICE_EMBED_MODES.find((item) => item.value === mode)?.label ?? mode;
}
