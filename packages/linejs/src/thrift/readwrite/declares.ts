// @ts-types="npm:@types/thrift"
import * as thrift from "thrift";
import { Buffer } from "node:buffer";

export const genHeader = {
	3: (name: string) => {
		return Buffer.from([
			0x80,
			1,
			0,
			1,
			0,
			0,
			0,
			name.length,
			...Buffer.from(name),
			0,
			0,
			0,
			0,
		]);
	},
	4: (name: string) => {
		return Buffer.from([0x82, 0x21, 0, name.length, ...Buffer.from(name)]);
	},
};

export const Protocols = {
	4: thrift.TCompactProtocol,
	3: thrift.TBinaryProtocol,
};

export type ProtocolKey = keyof typeof Protocols;

/**
 * @description NestedArray is an array that represents each value of thrift that is compatible with CHRLINE.
 * ```
 * [thrift_type, field_id, value]
 * ```
 */
export type NestedArray = Array<
	| null
	| undefined
	| [2, number, 0 | 1 | boolean | undefined]
	| [3, number, number?]
	| [4, number, number?]
	| [6, number, number?]
	| [8, number, number?]
	| [10, number, number | bigint | undefined]
	| [11, number, string | Buffer | undefined]
	| [12, number, NestedArray?]
	| [
		13,
		number,
		[
			number,
			number,
			(
				| Record<string | number, NestedArray>
				| Record<string | number, unknown>
			),
		]?,
	]
	| [14, number, [number, Array<NestedArray> | Array<unknown>]?]
	| [15, number, [number, Array<NestedArray> | Array<unknown>]?]
>;
export interface ParsedThrift {
	data: any;
	_info: {
		fname: string;
		mtype: number;
		rseqid: number;
	};
}
