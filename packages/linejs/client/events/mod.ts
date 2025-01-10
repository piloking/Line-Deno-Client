import type { Operation, SquareEvent } from "@evex/linejs-types";
import type { Client } from "../client.ts";
import * as events from "./events.ts";

export type SourceEvent = {
	type: "square";
	event: SquareEvent;
} | {
	type: "talk";
	event: Operation;
};

export const wrapEvents = async (
	source: SourceEvent,
	client: Client,
): Promise<LINEEvent> => {
	if (source.type === "talk") {
		switch (source.event.type) {
			case "RECEIVE_MESSAGE":
			case "SEND_MESSAGE":
				return await events.MessageTalkLINEEvent.fromSource(source, client);
			case "NOTIFIED_READ_MESSAGE":
			case "SEND_CHAT_CHECKED":
				return new events.ReadMessageLINEEvent(source);
			case "DESTROY_MESSAGE":
			case "NOTIFIED_DESTROY_MESSAGE":
				return new events.UnsendMessageLINEEvent(source);
			case "SEND_REACTION":
				return new events.SendReactionLINEEvent(source);
			case "NOTIFIED_UPDATE_PROFILE":
				return new events.UpdateProfileLINEEvent(source);
			case "NOTIFIED_UPDATE_PROFILE_CONTENT":
				return new events.UpdateProfileLINEEvent(source);
			case "NOTIFIED_JOIN_CHAT":
				return new events.JoinChatLINEEvent(source);
			case "NOTIFIED_ACCEPT_CHAT_INVITATION":
				return new events.AcceptInviteLINEEvent(source);
			case "INVITE_INTO_CHAT":
				return new events.InviteLINEEvent(source);
			case "DELETE_SELF_FROM_CHAT":
				return new events.LeaveChatLINEEvent(source);
		}
	} else {
		switch (source.event.type) {
			case "SEND_MESSAGE":
			case "RECEIVE_MESSAGE":
			case "NOTIFICATION_MESSAGE":
				return new events.MessageSquareLINEEvent(source, client);
		}
	}
	return new events.UnknownLINEEvent(source);
};

export type LINEEvent =
	| events.AcceptInviteLINEEvent
	| events.InviteLINEEvent
	| events.JoinChatLINEEvent
	| events.LeaveChatLINEEvent
	| events.MessageSquareLINEEvent
	| events.MessageTalkLINEEvent
	| events.ReadMessageLINEEvent
	| events.SendReactionLINEEvent
	| events.UnsendMessageLINEEvent
	| events.UpdateProfileLINEEvent
	| events.UnknownLINEEvent;
