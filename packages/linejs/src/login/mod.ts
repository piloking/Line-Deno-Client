import { RequestClient } from "../request/mod.ts";
import type { ClientInitBase } from "../core/types.ts";
import { Thrift } from "@evex/linejs-types/thrift";

export class Login {
    constructor(init: ClientInitBase) {
    }

    /**
     * Login with email and password.
     * @param email account e-mail address
     * @param password account password
     * @param pinCode Custom pin-code. It have to be 6-digit.
     */
    async withPassword(email: string, password: string, pinCode: string) {
    }
}
