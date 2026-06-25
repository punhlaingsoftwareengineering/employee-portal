import type { RequestHandler } from '@sveltejs/kit';
import { subscribeNotifications } from '$lib/server/notification-bus';

export const GET: RequestHandler = async ({ request }) => {
	const stream = new ReadableStream({
		start(controller) {
			const encoder = new TextEncoder();

			const send = (payload: string) => {
				controller.enqueue(encoder.encode(`event: notification\ndata: ${payload}\n\n`));
			};

			const unsubscribe = subscribeNotifications((notification) => {
				send(JSON.stringify(notification));
			});

			const heartbeat = setInterval(() => {
				controller.enqueue(encoder.encode(': heartbeat\n\n'));
			}, 30_000);

			request.signal.addEventListener('abort', () => {
				clearInterval(heartbeat);
				unsubscribe();
				controller.close();
			});
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
