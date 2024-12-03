export {
    type NestedArray,
    type ParsedThrift,
    type ProtocolKey,
    Protocols,
} from "./readwrite/declares.ts";

import { ThriftRenameParser } from "./parser/parser.ts";
import { readThrift, readThriftStruct } from "./readwrite/read.ts";
import { writeThrift } from "./readwrite/write.ts";

/**
 * Thrift Client
 */
export class Thrift extends ThriftRenameParser {
    readThrift(
        ...params: Parameters<typeof readThrift>
    ): ReturnType<typeof readThrift> {
        return readThrift(...params);
    }

    readThriftStruct(
        ...params: Parameters<typeof readThriftStruct>
    ): ReturnType<typeof readThriftStruct> {
        return readThriftStruct(...params);
    }

    writeThrift(
        ...params: Parameters<typeof writeThrift>
    ): ReturnType<typeof writeThrift> {
        return writeThrift(...params);
    }
}
