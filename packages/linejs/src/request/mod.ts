import {
    type NestedArray,
    type ParsedThrift,
    type ProtocolKey,
    Protocols,
} from "../thrift/mod.ts";
import type { DeviceDetails } from "../core/utils/devices.ts";
import type { ClientInitBase } from "../core/types.ts";
import type { Client } from "../core/mod.ts";

interface RequestClientInit extends ClientInitBase {
    deviceDetails: DeviceDetails;

    /**
     * API Endpoint
     * @default gw.line.naver.jp
     */
    endpoint?: string;
}
/**
 * Request Client
 */
export class RequestClient {
    client: Client;
    endpoint: string;
    userAgent: string;
    systemType: string;
    static readonly EXCEPTION_TYPES: Record<string, string | undefined> = {
        "/S3": "TalkException",
        "/S4": "TalkException",
        "/SYNC4": "TalkException",
        "/SYNC3": "TalkException",
        "/CH3": "ChannelException",
        "/CH4": "ChannelException",
        "/SQ1": "SquareException",
        "/LIFF1": "LiffException",
        "/api/v3p/rs": "TalkException",
        "/api/v3/TalkService.do": "TalkException",
    };

    constructor(init: RequestClientInit) {
        const deviceDetails = init.deviceDetails;
        this.endpoint = init.endpoint ?? "gw.line.naver.jp";
        this.systemType =
            `${deviceDetails.device}\t${deviceDetails.appVersion}\t${deviceDetails.systemName}\t${deviceDetails.systemVersion}`;
        this.userAgent = `Line/${deviceDetails.appVersion}`;
        this.client = init.client;
    }

    /**
     * @description Request to LINE API.
     *
     * @param value - The thrift value(argument) to request.
     * @param methodName - The method name of the request.
     * @param protocolType - The protocol type of the request.
     * @param parse - Whether to parse the response.
     * @param path - The path of the request.
     * @param headers - The headers of the request.
     * @param timeout - The timeout milliseconds of the request.
     * @param manyargs - Whether to enclose value in `[[12, 1, value]]`.
     * @returns The response.
     */
    public async request<T = unknown>(
        value: NestedArray,
        methodName: string,
        protocolType: ProtocolKey = 3,
        parse: boolean | string = true,
        path: string = "/S3",
        headers: Record<string, string | undefined> = {},
        timeout = this.client.timeout,
        manyargs = false,
    ): Promise<T> {
        return (
            await this.requestCore(
                path,
                manyargs ? value : [[12, 1, value]],
                methodName,
                protocolType,
                headers,
                undefined,
                parse,
                undefined,
                timeout,
            )
        ).data.success;
    }

    /**
     * @description Request to LINE API by raw.
     *
     * @param {string} [path] - The path of the request.
     * @param {NestedArray} [value] - The value to request.
     * @param {string} [methodName] - The method name of the request.
     * @param {ProtocolKey} [protocolType] - The protocol type of the request.
     * @param {object} [appendHeaders={}] - The headers to append to the request.
     * @param {string} [overrideMethod="POST"] - The method of the request.
     * @param {boolean | string} [parse=true] - Whether to parse the response.
     * @param {boolean} [isReRequest=false] - Is Re-Request.
     * @param {number} [timeout=this.timeOutMs] - The timeout milliseconds of the request.
     * @returns {Promise<ParsedThrift>} The response.
     * @throws {InternalError} If the request fails or timeout.
     */
    private async requestCore(
        path: string,
        value: NestedArray,
        methodName: string,
        protocolType: ProtocolKey,
        appendHeaders: object = {},
        overrideMethod: string = "POST",
        parse: boolean | string = true,
        isReRequest: boolean = false,
        timeout: number = 1000,
    ): Promise<ParsedThrift> {
        const Protocol = Protocols[protocolType];

        const headers = {
            ...this.getHeader(overrideMethod),
            ...appendHeaders,
        };

        const Trequest = this.client.thrift.writeThrift(
            value,
            methodName,
            Protocol,
        );
        const req = new Request(
            `https://${this.endpoint}${path}`,
            {
                method: overrideMethod,
                headers,
                signal: AbortSignal.timeout(timeout),
                body: Trequest,
            },
        );

        const response = await fetch(req);
        const nextToken = response.headers.get("x-line-next-access");
        if (nextToken) {
            console.warn("Next token");
        }
        const body = await response.arrayBuffer();
        const parsedBody = new Uint8Array(body);
        let res: ParsedThrift;
        try {
            res = this.client.thrift.readThrift(parsedBody, Protocol);
        } catch {
            throw new Error(
                `Request internal failed, ${methodName}(${path}) -> Invalid response buffer: <${
                    [...parsedBody].map((e) => e.toString(16)).join(" ")
                }>`,
            );
        }
        if (parse === true) {
            this.client.thrift.rename_data(res);
        } else if (typeof parse === "string") {
            res.data.success = this.client.thrift.rename_thrift(
                parse,
                res.data[0],
            );
            delete res.data[0];
            if (res.data[1]) {
                const structName = RequestClient.EXCEPTION_TYPES[path] ||
                    "TalkException";
                if (structName) {
                    res.data.e = this.client.thrift.rename_thrift(
                        structName,
                        res.data[1],
                    );
                } else {
                    res.data.e = res.data[1];
                }
                delete res.data[1];
            }
        }

        const isRefresh = Boolean(
            res.data.e &&
                res.data.e["code"] === "MUST_REFRESH_V3_TOKEN" &&
                await this.client.storage.get("refreshToken"),
        );

        if (res.data.e && !isRefresh) {
            throw new Error(
                `Request internal failed, ${methodName}(${path}) -> ` +
                    JSON.stringify(res.data.e),
            );
        }

        if (isRefresh && !isReRequest) {
            throw new Error("Refresh token is not supported.");
            /*
            TODO:
            await this.tryRefreshToken();
            return this.rawRequest(
                path,
                value,
                methodName,
                protocolType,
                appendHeaders,
                overrideMethod,
                parse,
                true,
            );*/
        }
        return res;
    }

    /**
     * Get HTTP headers for a request.
     * @param {string} [overrideMethod="POST"] The HTTP method to use in the `x-lhm` header.
     * @returns {Record<string, string>} An object with the headers as key-value pairs.
     * @throws {InternalError} If the client has not been setup yet.
     */
    public getHeader(
        overrideMethod: string = "POST",
    ): Record<string, string> {
        const header = {
            Host: this.endpoint,
            accept: "application/x-thrift",
            "user-agent": this.userAgent,
            "x-line-application": this.systemType,
            "content-type": "application/x-thrift",
            "x-lal": "ja_JP",
            "x-lpv": "1",
            "x-lhm": overrideMethod,
            "accept-encoding": "gzip",
        } as Record<string, string>;

        if (this.client.authToken) {
            header["x-line-access"] = this.client.authToken;
        }

        return header;
    }
}
