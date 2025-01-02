import type { BaseClient } from "../base/mod.ts";
import { type LINEEvent, type SourceEvent, wrapEvents } from "./events/mod.ts";

export interface ListenOptions {
	/**
	 * A boolean of whether to enable receiving talk events.
	 * @default true
	 */
	talk?: boolean;

	/**
	 * A boolean of whether to enable receiving square (OpenChat) events.
	 * @default false
	 */
	square?: boolean;

	/**
	 * A AbortSignal to stop listening.
	 */
	signal?: AbortSignal;
}

export class Client {
	readonly base: BaseClient;
	constructor(base: BaseClient) {
		this.base = base;
	}

	/**
	 * Listens events.
	 * @param opts Options
	 * @returns Async generator
	 */
	async *listen(opts: ListenOptions): AsyncGenerator<LINEEvent> {
		const polling = this.base.createPolling();
		const stream = new ReadableStream<SourceEvent>({
			start(controller) {
				let listeningTalk = false;
				let listeningSquare = false;
				const tryToEnd = () => {
					if (!listeningTalk && !listeningSquare) {
						controller.close();
					}
				};
				if (opts.talk !== false) {
					listeningTalk = true;
					(async () => {
						for await (
							const event of polling.listenTalkEvents({
								signal: opts.signal,
							})
						) {
							controller.enqueue({ type: "talk", event });
						}
						listeningTalk = false;
						tryToEnd();
					})();
				}
				if (opts.square !== false) {
					listeningSquare = true;
					(async () => {
						for await (
							const event of polling.listenSquareEvents({
								signal: opts.signal,
							})
						) {
							controller.enqueue({ type: "square", event });
						}
						listeningSquare = false;
						tryToEnd();
					})();
				}
			},
		});

		const reader = stream.getReader();
		while (true) {
			const { done, value } = await reader.read();
			if (value) {
				yield wrapEvents(value, this);
			}
			if (done) {
				return;
			}
		}
	}

	/** Gets auth token for LINE. */
	get authToken(): string {
		// NOTE: client is constructed when logined, so authToken is not undefined.
		return this.base.authToken as string;
	}
}
