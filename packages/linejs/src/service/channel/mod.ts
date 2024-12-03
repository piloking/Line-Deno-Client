// For Channel (channel, voom, etc)

import type { ProtocolKey } from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import type { ClientInitBase } from "../../core/types.ts";
import type { Client } from "../../core/mod.ts";

export class ChannelClient {
    public ChannelService_API_PATH = "/CH3";
    public ChannelService_PROTOCOL_TYPE: ProtocolKey = 3;
    public client: Client;

    constructor(param: ClientInitBase) {
        this.client = param.client;
    }

    /**
     * @description Gets the ChannelToken by channelId.\
     * channelIds:
     * - linevoom: 1341209850
     */
    public approveChannelAndIssueChannelToken(options: {
        channelId: string;
    }): Promise<LINETypes.ChannelToken> {
        const { channelId } = {
            ...options,
        };
        return this.client.request.request<LINETypes.ChannelToken>(
            [[11, 1, channelId]],
            "approveChannelAndIssueChannelToken",
            this.ChannelService_PROTOCOL_TYPE,
            true,
            this.ChannelService_API_PATH,
            {},
            this.client.timeout,
            false,
        );
    }
}
