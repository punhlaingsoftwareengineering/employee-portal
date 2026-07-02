import type { RequestHandler } from '@sveltejs/kit';
import { subscribeNotifications } from '$lib/server/notification-bus';

export const GET: RequestHandler = async ({ request }) => {
	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();
			let closed = false;
			let heartbeat: ReturnType<typeof setInterval> | undefined;
			let unsubscribe: (() => void) | undefined;

			const cleanup = () => {
				if (closed) return;
				closed = true;
				if (heartbeat !== undefined) clearInterval(heartbeat);
				unsubscribe?.();
				try {
					controller.close();
				} catch {
					// Stream already closed (e.g. duplicate abort during HMR/navigation)
				}
			};

			const send = (payload: string) => {
				if (closed) return;
				try {
					controller.enqueue(encoder.encode(`event: notification\ndata: ${payload}\n\n`));
				} catch {
					cleanup();
				}
			};

			unsubscribe = subscribeNotifications((notification) => {
				send(JSON.stringify(notification));
			});

			heartbeat = setInterval(() => {
				if (closed) return;
				try {
					controller.enqueue(encoder.encode(': heartbeat\n\n'));
				} catch {
					cleanup();
				}
			}, 30_000);

			request.signal.addEventListener('abort', cleanup);
		}
	});

	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache, no-transform',
			Connection: 'keep-alive'
		}
	});
};
