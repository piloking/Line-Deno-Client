// For Liff (liff, etc)
import {
	LINEStruct,
	type NestedArray,
	type ProtocolKey,
} from "../../thrift/mod.ts";
import type * as LINETypes from "@evex/linejs-types";
import { InternalError } from "../../core/utils/error.ts";
import type { BaseClient } from "../../core/mod.ts";
import type { BaseService } from "../types.ts";

export class LiffService implements BaseService {
	static readonly LINE_LIFF_ENDPOINT = "https://api.line.me/message/v3/share";
	static readonly CONSENT_API_URL =
		"https://access.line.me/dialog/api/permissions";
	static readonly AUTH_CONSENT_URL =
		"https://access.line.me/oauth2/v2.1/authorize/consent";
	liffTokenCache: { [key: string]: string } = {};
	requestPath = "/LIFF1";
	protocolType: ProtocolKey = 4;
	errorName = "LiffServiceError";
	liffId = "2006747340-AoraPvdD";
	csrfRegExp = /<input type="hidden" name="__csrf" id="__csrf" value="(.*?)">/;

	client: BaseClient;

	constructor(client: BaseClient) {
		this.client = client;
	}

	/**
	 * @description Gets the LiffToken by liffId and chatMid.
	 */
	public async issueLiffView(options: {
		chatMid?: string;
		liffId: string;
		lang?: string;
	}): Promise<LINETypes.LiffViewResponse> {
		const { chatMid, liffId, lang } = {
			lang: "ja_JP",
			...options,
		};

		let context: NestedArray[0] = [12, 1, []];
		let chaLINETypes;
		let chat: NestedArray[0];
		if (chatMid) {
			chat = [11, 1, chatMid];
			if (["u", "c", "r"].includes(chatMid[0])) {
				chaLINETypes = 2;
			} else {
				chaLINETypes = 3;
			}
			context = [12, chaLINETypes, [chat]];
		}
		return await this.client.request.request<LINETypes.LiffViewResponse>(
			[[12, 1, [
				[11, 1, liffId],
				[12, 2, [context]],
				[11, 3, lang],
			]]],
			"issueLiffView",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
	async getLiffViewWithoutUserContext(
		...param: Parameters<
			typeof LINEStruct.getLiffViewWithoutUserContext_args
		>
	): Promise<LINETypes.getLiffViewWithoutUserContext_result["success"]> {
		return await this.client.request.request(
			LINEStruct.getLiffViewWithoutUserContext_args(...param),
			"getLiffViewWithoutUserContext",
			this.protocolType,
			true,
			this.requestPath,
		);
	}

	async issueSubLiffView(
		...param: Parameters<typeof LINEStruct.issueSubLiffView_args>
	): Promise<LINETypes.issueSubLiffView_result["success"]> {
		return await this.client.request.request(
			LINEStruct.issueSubLiffView_args(...param),
			"issueSubLiffView",
			this.protocolType,
			true,
			this.requestPath,
		);
	}
	/**
	 * @description Gets the LiffToken by liffId and chatMid with consent.
	 */
	public async getLiffToken(options: {
		chatMid?: string;
		liffId: string;
		lang?: string;
		tryConsent?: boolean;
	}): Promise<string> {
		const { chatMid, liffId, lang, tryConsent } = {
			lang: "ja_JP",
			tryConsent: true,
			...options,
		};
		try {
			const liff = await this.issueLiffView({
				liffId,
				chatMid,
				lang,
			});
			return liff.accessToken;
		} catch (e) {
			if ((e as InternalError).data) {
				const error = e as InternalError;

				this.client.log("liff-error", { ...error.data });
				if (
					(error.data.liffException as LINETypes.LiffException)
							.code ===
						"CONSENT_REQUIRED" &&
					tryConsent
				) {
					const data = error
						.data.liffException as LINETypes.LiffException;
					const payload = data.payload;
					const { channelId, consentUrl } = payload.consentRequired;
					const toType = chatMid && this.client.getToType(chatMid);
					let hasConsent = false;
					if (channelId && consentUrl) {
						if (
							toType === 4 ||
							this.client.device.startsWith("DESKTOP")
						) {
							hasConsent = await this.tryConsentAuthorize(
								consentUrl,
								channelId,
							);
						} else {
							hasConsent = await this.tryConsentLiff(channelId);
						}
						if (hasConsent) {
							options.tryConsent = false;
							return this.getLiffToken(options);
						}
					}
				}
			}
			throw new InternalError(
				this.errorName,
				`Failed to get LiffToken: ${liffId}${chatMid ? "@" + chatMid : ""}`,
			);
		}
	}

	/**
	 * @description Send the LiffMessages.
	 */
	public async sendLiff(options: {
		to: string;
		messages: { type: string; text?: string }[];
		tryConsent?: boolean;
		forceIssue?: boolean;
	}): Promise<any> {
		let token: string;
		const {
			to,
			messages,
			tryConsent: _tryConsent,
			forceIssue,
		} = {
			tryConsent: true,
			forceIssue: false,
			...options,
		};
		if (!this.liffTokenCache[to] || forceIssue) {
			token = await this.getLiffToken({
				chatMid: to,
				liffId: this.liffId,
			});
		} else {
			token = this.liffTokenCache[to];
		}

		const liffHeaders = {
			Accept: "application/json, text/plain, */*",
			"User-Agent":
				"Mozilla/5.0 (Linux; Android 4.4.2; G730-U00 Build/JLS36C) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/30.0.0.0 Mobile Safari/537.36 Line/9.8.0",
			"Accept-Encoding": "gzip, deflate",
			"Accept-Language": "zh-TW,zh;q=0.9",
			Authorization: `Bearer ${token}`,
			"content-type": "application/json",
		};
		const payload = JSON.stringify({ messages });
		const response = await this.client.fetch(
			"https://api.line.me/message/v3/share",
			{
				method: "POST",
				body: payload,
				headers: liffHeaders,
			},
		);

		const responseBody = await response.json();
		if (!response.ok) {
			throw new InternalError(
				this.errorName,
				`Failed to send Liff message: ${response.statusText}`,
				responseBody,
			);
		}
		return responseBody;
	}

	private async tryConsentLiff(
		channelId: string,
		referer?: string,
	): Promise<boolean> {
		const payload = JSON.stringify({ on: ["P", "CM"], off: [] });
		const headers: Record<string, string> = {
			"X-LINE-ChannelId": channelId,
			"X-LINE-Access": this.client.authToken as string,
			"User-Agent":
				"Mozilla/5.0 (Linux; Android 8.0.1; SAMSUNG Realise/DeachSword; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/56.0.2924.87 Mobile Safari/537.36",
			"Content-Type": "application/json",
			"X-Line-Application": this.client.request.systemType as string,
			"X-Requested-With": "XMLHttpRequest",
			"Accept-Language": "ja-JP,en-US;q=0.8",
			...(referer ? { referer } : {}),
		};
		const response = await this.client.fetch(LiffService.CONSENT_API_URL, {
			method: "POST",
			body: payload,
			headers,
		});
		return response.ok;
	}

	private async tryConsentAuthorize(
		consentUrl: string,
		channelId: string,
		allPermission: string[] = ["P", "CM", "OC"],
		approvedPermission: string[] = ["P", "CM", "OC"],
	): Promise<boolean> {
		const headers: Record<string, string> = {
			"X-Line-Access": this.client?.authToken as string,
			"User-Agent": this.client.request.userAgent,
			"X-Line-Application": this.client.request.systemType as string,
		};

		const response = await this.client.fetch(consentUrl, {
			method: "GET",
			headers,
		});

		if (response.ok) {
			const cookies: string[] = [];
			response.headers.forEach((v, k) => {
				if (k === "set-cookie") {
					cookies.push(v.split(";")[0]);
				}
			});
			const text = await response.text();

			const csrfToken = (this.csrfRegExp.exec(text) || [null, null])[1];
			if (channelId && csrfToken) {
				headers["cookie"] = cookies.join("; ");
				headers["referer"] = consentUrl;
				const authResponse = await this.client.fetch(
					LiffService.AUTH_CONSENT_URL,
					{
						method: "POST",
						body: `${
							allPermission.map((e) => "allPermission=" + e)
								.join("&")
						}&${
							approvedPermission.map((e) => "approvedPermission=" + e).join("&")
						}&__WLS=&channelId=2006747340&__csrf=${csrfToken}&allow=true`,
						headers,
					},
				);
				return authResponse.ok;
			}
		}
		return false;
	}
}
