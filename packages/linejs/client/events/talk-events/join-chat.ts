import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";

/**
 * An event that indicates a user joined a chat.
 */
export class JoinChatLINEEvent extends LINEEventBase {
	readonly type: "join-chat" = "join-chat";
	readonly userMid: string;
	readonly chatMid: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type !== "NOTIFIED_JOIN_CHAT") {
			throw new TypeError("Wrong operation type");
		}
		if (
			typeof op.param1 === "undefined" ||
			typeof op.param2 === "undefined"
		) {
			throw new TypeError("Wrong param");
		}
		this.userMid = op.param2;
		this.chatMid = op.param1;
	}
}
