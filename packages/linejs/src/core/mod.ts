import { Login } from "../login/mod.ts";
import { Thrift } from "../thrift/mod.ts";
import { RequestClient } from "../request/mod.ts";
import { E2EE } from "../e2ee/mod.ts";
import { type Device, getDeviceDetails } from "./utils/devices.ts";
import { Thrift as def } from "@evex/linejs-types/thrift";
import type * as LINETypes from "@evex/linejs-types";
import { type BaseStorage, MemoryStorage } from "../storage/mod.ts";
import { TypedEventEmitter } from "./typed-event-emitter/index.ts";
import type { ClientEvents } from "./utils/events.ts";
import type { Log } from "./utils/events.ts";

export interface ClientInit {
    /**
     * version which LINE App to emurating
     */
    version?: string;

    /**
     * API Endpoint
     * @default "gw.line.naver.jp"
     */
    endpoint?: string;

    /**
     * Device
     */
    device: Device;

    /**
     * Storage
     * @default MemoryStorage
     */
    storage?: BaseStorage;
}

export interface Config {
    /**
     * Timeout
     * @default 30_000
     */
    timeout: number;
}

export class Client extends TypedEventEmitter<ClientEvents> {
    endpoint: string;
    device: Device;
    authToken?: string;
    login: Login;
    thrift: Thrift;
    request: RequestClient;
    storage: BaseStorage;
    e2ee: E2EE;
    user?: LINETypes.Profile;
    config: Config;
    constructor(init: ClientInit) {
        super();
        this.endpoint = init.endpoint ?? "gw.line.naver.jp";
        const deviceDetails = getDeviceDetails(init.device, init.version);
        if (!deviceDetails) {
            throw new Error(`Unsupported device: ${init.device}.`);
        }
        this.storage = init.storage ?? new MemoryStorage();
        this.request = new RequestClient({
            endpoint: this.endpoint,
            client: this,
            deviceDetails,
        });
        this.login = new Login({ client: this });
        this.thrift = new Thrift();
        this.e2ee = new E2EE({ client: this });
        this.thrift.def = def;
        this.device = init.device;
        this.config = {
            timeout: 30000,
        };
    }
    log(type: string, data: Record<string, any>) {
        console.log(type, data);
    }
}
