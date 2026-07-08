import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'pnpm run build && pnpm run preview', port: 1027 },
	testMatch: '**/*.e2e.{ts,js}'
});
