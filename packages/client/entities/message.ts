import type * as LINETypes from "../libs/thrift/line_types.ts";
import type { LooseType } from "./common.ts";

export type SquareMessage = LINETypes.SquareEventNotificationMessage & {
	content: string;
	reply: (
		options: MessageReplyOptions,
	) => Promise<LINETypes.SendMessageResponse>;
	send: (
		options: SquareMessageSendOptions,
	) => Promise<LINETypes.SendMessageResponse>;
	author: {
		pid: string;
		displayName: string;
	};
	//author: () => Promise<LINETypes.SquareMember>;
	square: () => Promise<LINETypes.GetSquareChatResponse>;
};

export type Message = LINETypes.Operation & {
	content: string;
	reply: (options: MessageReplyOptions) => Promise<LINETypes.Message>;
	send: (options: SquareMessageSendOptions) => Promise<LINETypes.Message>;
	author: () => Promise<LINETypes.Contact>;
	authorMid: string;
	chat: (() => Promise<LINETypes.Contact>) | false;
	group: (() => Promise<LINETypes.Chat>) | false;
};

export type MessageReplyOptions =
	| {
			text?: string;
			contentType?: LINETypes.ContentType;
			contentMetadata?: LooseType;
	  }
	| string;

export type SquareMessageSendOptions = MessageReplyOptions;
