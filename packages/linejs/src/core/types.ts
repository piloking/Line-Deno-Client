import type { Client } from "./mod.ts";
export interface ClientInitBase {
    /**
     * Client
     */
    client: Client;
}
export type fetchLike = (
    input: Request | URL | string,
    init?: RequestInit,
) => Promise<Response>;
