import type { Client } from "../../client.ts";
import type { Chat } from "./mod.ts";
import type * as line from "@evex/linejs-types";
import { TalkMessage } from "../message/mod.ts";

export interface MessageFetcher {
	fetch: (limit: number) => Promise<TalkMessage[]>;
}
export const createMessageFetcher = async (client: Client, chat: Chat) => {
	const boxes = await client.base.talk.getMessageBoxes({
		messageBoxListRequest: {},
	});
	const box = boxes.messageBoxes.find((box) => box.id === chat.mid);
	if (!box) {
		throw new Error("Message box not found.");
	}

	let lastMessageId: line.MessageBoxV2MessageId = box.lastDeliveredMessageId;
	return {
		async fetch(limit: number) {
			const messages = await client.base.talk.getPreviousMessagesV2WithRequest({
				request: {
					messageBoxId: box.id,
					endMessageId: lastMessageId,
					messagesCount: limit,
				},
			});
			const lastMessage = messages.at(-1)!;
			lastMessageId = {
				deliveredTime: lastMessage.deliveredTime,
				messageId: parseInt(lastMessage.id),
			};

			return await Promise.all(
				messages.map((message) => TalkMessage.fromRawTalk(message, client)),
			);
		},
	};
};
