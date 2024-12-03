import type * as LINETypes from "@evex/linejs-types";
type LogType = "login" | "request" | "response" | (string & {});

export interface Log {
	type: LogType;
	data: any;
}

export type ClientEvents = {
	pincall: (pincode: string) => void;
	qrcall: (loginUrl: string) => void;
	ready: (user: LINETypes.Profile) => void;
	end: (user: LINETypes.Profile) => void;
	"update:authToken": (authToken: string) => void;
	"update:profile": (profile: LINETypes.Profile) => void;
	"update:cert": (cert: string) => void;
	"update:qrcert": (qrCert: string) => void;
	log: (data: Log) => void;
	//"square:message": (squareMessage: SquareMessage) => void;
	//"square:status": (squareStatus: SquaerStatus) => void;
	"square:event": (squareEvent: LINETypes.SquareEvent) => void;
	//message: (message: Message) => void;
	// TODO: Add more as square
	//event: (talkEvent: LINETypes.Operation) => void;
};
