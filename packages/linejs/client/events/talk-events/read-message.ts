import type { SourceEvent } from "../mod.ts";
import { LINEEventBase } from "../shared.ts";

/**
 * An event that indicates a message has been read.
 */
export class ReadMessageLINEEvent extends LINEEventBase {
	readonly type: "read-message" = "read-message";
	readonly chatMid: string;
	readonly messageId: string;

	/**
	 * The mid of the user who read the message.
	 * This is a placeholder property and will be replaced in the future.
	 */
	readonly readUserMid?: string;

	constructor(source: SourceEvent & { type: "talk" }) {
		super(source);
		const op = source.event;
		if (op.type === "NOTIFIED_READ_MESSAGE") {
			if (
				typeof op.param1 === "undefined" ||
				typeof op.param2 === "undefined" ||
				typeof op.param3 === "undefined"
			) {
				throw new TypeError("Wrong param");
			}
			this.chatMid = op.param1;
			this.readUserMid = op.param2;
			this.messageId = op.param3;
			return;
		} else if (op.type === "SEND_CHAT_CHECKED") {
			if (
				typeof op.param1 === "undefined" ||
				typeof op.param2 === "undefined"
			) {
				throw new TypeError("Wrong param");
			}
			this.chatMid = op.param1;
			this.messageId = op.param2;
			return;
		}
		throw new TypeError("Wrong operation type");
	}
}
