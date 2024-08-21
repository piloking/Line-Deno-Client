import * as CryptoJS from "npm:crypto-js";
import * as curve25519 from "npm:curve25519-js";
import * as crypto from "node:crypto";
import { Buffer } from "node:buffer";

// auto-generated by chatGPT

class E2EE {
	getE2EELocalPublicKey(mid, keyId) {
		const toType = this.getToType(mid);
		let key = null;
		let fd, fn;

		if (toType === 0) {
			fd = ".e2eePublicKeys";
			fn = `key_id_${keyId}.json`;
			if (keyId !== null) {
				key = this.getCacheData(fd, fn, false);
			}
			let receiverKeyData;
			if (key === null) {
				receiverKeyData = this.negotiateE2EEPublicKey(mid);
				const specVersion = this.checkAndGetValue(
					receiverKeyData,
					"specVersion",
					3,
				);
				if (specVersion === -1) {
					throw new Error(`Not support E2EE on ${mid}`);
				}
				const publicKey = this.checkAndGetValue(
					receiverKeyData,
					"publicKey",
					2,
				);
				const receiverKeyId = this.checkAndGetValue(publicKey, "keyId", 2);
				receiverKeyData = this.checkAndGetValue(publicKey, "keyData", 4);
				if (receiverKeyId === keyId) {
					key = btoa(String.fromCharCode(...new Uint8Array(receiverKeyData)));
					this.saveCacheData(fd, fn, key, false);
				} else {
					throw new Error(
						`E2EE key id-${keyId} not found on ${mid}, key id should be ${receiverKeyId}`,
					);
				}
			}
		} else {
			fd = ".e2eeGroupKeys";
			fn = `${mid}.json`;
			key = this.getCacheData(fd, fn, false);
			if (keyId !== null && key !== null) {
				const keyData = JSON.parse(key);
				if (keyId !== keyData["keyId"]) {
					this.log(`keyId mismatch: ${mid}`);
					key = null;
				}
			} else {
				key = null;
			}
			if (key === null) {
				let E2EEGroupSharedKey;
				try {
					E2EEGroupSharedKey = this.getLastE2EEGroupSharedKey(2, mid);
				} catch (e) {
					if (e.code === 5) {
						this.log(`E2EE key not registered on ${mid}: ${e.message}`);
						E2EEGroupSharedKey = this.tryRegisterE2EEGroupKey(mid);
					}
				}
				const groupKeyId = this.checkAndGetValue(
					E2EEGroupSharedKey,
					"groupKeyId",
					2,
				);
				const creator = this.checkAndGetValue(E2EEGroupSharedKey, "creator", 3);
				const creatorKeyId = this.checkAndGetValue(
					E2EEGroupSharedKey,
					"creatorKeyId",
					4,
				);
				const receiver = this.checkAndGetValue(
					E2EEGroupSharedKey,
					"receiver",
					5,
				);
				const receiverKeyId = this.checkAndGetValue(
					E2EEGroupSharedKey,
					"receiverKeyId",
					6,
				);
				const encryptedSharedKey = this.checkAndGetValue(
					E2EEGroupSharedKey,
					"encryptedSharedKey",
					7,
				);
				const selfKey = atob(
					this.getE2EESelfKeyDataByKeyId(receiverKeyId)["privKey"],
				);
				const creatorKey = this.getE2EELocalPublicKey(creator, creatorKeyId);
				const aesKey = this.generateSharedSecret(selfKey, creatorKey);
				const aes_key = this.getSHA256Sum(aesKey, "Key");
				const aes_iv = this._xor(this.getSHA256Sum(aesKey, "IV"));
				const aes = CryptoJS.AES.decrypt(
					{ ciphertext: encryptedSharedKey },
					aes_key,
					{
						iv: aes_iv,
						mode: CryptoJS.mode.CBC,
						padding: CryptoJS.pad.Pkcs7,
					},
				);

				let decrypted;
				try {
					decrypted = CryptoJS.enc.Utf8.stringify(aes);
				} catch (e) {
					decrypted = aes;
				}
				this.log(`[getE2EELocalPublicKey] decrypted: ${decrypted}`, true);
				const data = {
					"privKey": btoa(decrypted),
					"keyId": groupKeyId,
				};
				key = JSON.stringify(data);
				this.saveCacheData(fd, fn, key, false);
			}
			return JSON.parse(key);
		}
		return atob(key);
	}

	generateSharedSecret(privateKey, publicKey) {
		return curve25519.sharedKey(
			Uint8Array.from(privateKey),
			Uint8Array.from(publicKey),
		);
	}

	_xor(buf) {
		const bufLength = Math.floor(buf.length / 2);
		const buf2 = Buffer.alloc(bufLength);
		for (let i = 0; i < bufLength; i++) {
			buf2[i] = buf[i] ^ buf[bufLength + i];
		}
		return buf2;
	}

	getSHA256Sum(...args) {
		const hash = crypto.createHash("sha256");
		for (let arg of args) {
			if (typeof arg === "string") {
				arg = Buffer.from(arg);
			}
			hash.update(arg);
		}
		return hash.digest();
	}

	_encryptAESECB(aesKey, plainData) {
		const cipher = crypto.createCipheriv("aes-128-ecb", aesKey, null);
		cipher.setAutoPadding(false);
		return Buffer.concat([cipher.update(plainData), cipher.final()]);
	}

	decryptKeyChain(publicKey, privateKey, encryptedKeyChain) {
		const sharedSecret = this.generateSharedSecret(privateKey, publicKey);
		const aesKey = this.getSHA256Sum(sharedSecret, "Key");
		const aesIv = this._xor(this.getSHA256Sum(sharedSecret, "IV"));
		const decipher = crypto.createDecipheriv("aes-128-cbc", aesKey, aesIv);
		let keychainData = Buffer.concat([
			decipher.update(encryptedKeyChain),
			decipher.final(),
		]);
		let key = keychainData.toString("hex");
		key = this.bin2bytes(key);
		const tc = new this.TCompactProtocol(this, { passProtocol: true });
		tc.data = key;
		key = tc.x(false)[1];
		const publicKeyBytes = Buffer.from(key[0][4]);
		const privateKeyBytes = Buffer.from(key[0][5]);
		return [privateKeyBytes, publicKeyBytes];
	}

	encryptDeviceSecret(publicKey, privateKey, encryptedKeyChain) {
		const sharedSecret = this.generateSharedSecret(privateKey, publicKey);
		const aesKey = this.getSHA256Sum(sharedSecret, "Key");
		encryptedKeyChain = this._xor(this.getSHA256Sum(encryptedKeyChain));
		const cipher = crypto.createCipheriv("aes-128-ecb", aesKey, null);
		cipher.setAutoPadding(false);
		const keychainData = Buffer.concat([
			cipher.update(encryptedKeyChain),
			cipher.final(),
		]);
		return keychainData;
	}

	generateAAD(a, b, c, d, e = 2, f = 0) {
		let aad = Buffer.alloc(0);
		aad = Buffer.concat([aad, Buffer.from(a)]);
		aad = Buffer.concat([aad, Buffer.from(b)]);
		aad = Buffer.concat([aad, this.getIntBytes(c)]);
		aad = Buffer.concat([aad, this.getIntBytes(d)]);
		aad = Buffer.concat([aad, this.getIntBytes(e)]);
		aad = Buffer.concat([aad, this.getIntBytes(f)]);
		return aad;
	}

	getSHA256Sum(...args) {
		const hash = crypto.createHash("sha256");
		for (let arg of args) {
			if (typeof arg === "string") {
				arg = Buffer.from(arg);
			}
			hash.update(arg);
		}
		return hash.digest();
	}

	_xor(buf) {
		const bufLength = Math.floor(buf.length / 2);
		const buf2 = Buffer.alloc(bufLength);
		for (let i = 0; i < bufLength; i++) {
			buf2[i] = buf[i] ^ buf[bufLength + i];
		}
		return buf2;
	}

	encryptE2EEMessage(
		to,
		text,
		specVersion = 2,
		isCompact = false,
		contentType = 0,
	) {
		const _from = this.mid;
		const selfKeyData = this.getE2EESelfKeyData(_from);

		if (to.length === 0 || ![0, 1, 2].includes(this.getToType(to))) {
			throw new Error("Invalid mid");
		}

		const senderKeyId = selfKeyData.keyId;
		let receiverKeyId, keyData;

		if (this.getToType(to) === 0) {
			const privateKey = Buffer.from(selfKeyData.privKey, "base64");
			const receiverKeyData = this.negotiateE2EEPublicKey(to);
			specVersion = this.checkAndGetValue(receiverKeyData, "specVersion", 3);

			if (specVersion === -1) {
				throw new Error(`Not support E2EE on ${to}`);
			}

			const publicKey = this.checkAndGetValue(receiverKeyData, "publicKey", 2);
			receiverKeyId = this.checkAndGetValue(publicKey, "keyId", 2);
			const receiverKeyDataBuffer = this.checkAndGetValue(
				publicKey,
				"keyData",
				4,
			);
			keyData = this.generateSharedSecret(privateKey, receiverKeyDataBuffer);
		} else {
			const groupK = this.getE2EELocalPublicKey(to, null);
			const privK = Buffer.from(groupK.privKey, "base64");
			const pubK = Buffer.from(selfKeyData.pubKey, "base64");
			receiverKeyId = groupK.keyId;
			keyData = this.generateSharedSecret(privK, pubK);
		}

		let chunks;
		if (contentType === 15) {
			chunks = this.encryptE2EELocationMessage(
				senderKeyId,
				receiverKeyId,
				keyData,
				specVersion,
				text,
				to,
				_from,
				isCompact,
			);
		} else {
			chunks = this.encryptE2EETextMessage(
				senderKeyId,
				receiverKeyId,
				keyData,
				specVersion,
				text,
				to,
				_from,
				isCompact,
			);
		}

		return chunks;
	}

	encryptE2EETextMessage(
		senderKeyId,
		receiverKeyId,
		keyData,
		specVersion,
		text,
		to,
		_from,
		isCompact = false,
	) {
		const salt = crypto.randomBytes(16);
		const gcmKey = this.getSHA256Sum(keyData, salt, Buffer.from("Key"));
		const aad = this.generateAAD(
			to,
			_from,
			senderKeyId,
			receiverKeyId,
			specVersion,
			0,
		);
		const sign = crypto.randomBytes(16);
		const data = Buffer.from(JSON.stringify({ text: text }));
		const encData = this.encryptE2EEMessageV2(data, gcmKey, sign, aad);

		let bSenderKeyId = Buffer.from(this.getIntBytes(senderKeyId));
		let bReceiverKeyId = Buffer.from(this.getIntBytes(receiverKeyId));

		if (isCompact) {
			const compact = new this.TCompactProtocol(this);
			bSenderKeyId = Buffer.from(compact.writeI32(parseInt(senderKeyId)));
			bReceiverKeyId = Buffer.from(compact.writeI32(parseInt(receiverKeyId)));
		}

		this.log(
			`senderKeyId: ${senderKeyId} (${bSenderKeyId.toString("hex")})`,
			true,
		);
		this.log(
			`receiverKeyId: ${receiverKeyId} (${bReceiverKeyId.toString("hex")})`,
			true,
		);

		return [salt, encData, sign, bSenderKeyId, bReceiverKeyId];
	}

	encryptE2EELocationMessage(
		senderKeyId,
		receiverKeyId,
		keyData,
		specVersion,
		location,
		to,
		_from,
		isCompact = false,
	) {
		const salt = crypto.randomBytes(16);
		const gcmKey = this.getSHA256Sum(keyData, salt, Buffer.from("Key"));
		const aad = this.generateAAD(
			to,
			_from,
			senderKeyId,
			receiverKeyId,
			specVersion,
			15,
		);
		const sign = crypto.randomBytes(16);
		const data = Buffer.from(JSON.stringify({ location: location }));
		const encData = this.encryptE2EEMessageV2(data, gcmKey, sign, aad);

		let bSenderKeyId = Buffer.from(this.getIntBytes(senderKeyId));
		let bReceiverKeyId = Buffer.from(this.getIntBytes(receiverKeyId));

		if (isCompact) {
			const compact = new this.TCompactProtocol(this);
			bSenderKeyId = Buffer.from(compact.writeI32(parseInt(senderKeyId)));
			bReceiverKeyId = Buffer.from(compact.writeI32(parseInt(receiverKeyId)));
		}

		this.log(
			`senderKeyId: ${senderKeyId} (${bSenderKeyId.toString("hex")})`,
			true,
		);
		this.log(
			`receiverKeyId: ${receiverKeyId} (${bReceiverKeyId.toString("hex")})`,
			true,
		);

		return [salt, encData, sign, bSenderKeyId, bReceiverKeyId];
	}

	encryptE2EEMessageV2(data, gcmKey, nonce, aad) {
		const cipher = crypto.createCipheriv("aes-256-gcm", gcmKey, nonce);
		cipher.setAAD(aad);
		const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
		const tag = cipher.getAuthTag();
		return Buffer.concat([encrypted, tag]);
	}

	decryptE2EETextMessage(messageObj, isSelf = true) {
		const _from = this.checkAndGetValue(messageObj, "_from", 1);
		const to = this.checkAndGetValue(messageObj, "to", 2);
		const toType = this.checkAndGetValue(messageObj, "toType", 3);
		const metadata = this.checkAndGetValue(messageObj, "contentMetadata", 18);
		const specVersion = metadata.e2eeVersion || "2";
		const contentType = this.checkAndGetValue(messageObj, "contentType", 15);
		let chunks = this.checkAndGetValue(messageObj, "chunks", 20);

		chunks = chunks.map((chunk) =>
			typeof chunk === "string" ? Buffer.from(chunk, "utf-8") : chunk
		);

		const senderKeyId = this.byte2int(chunks[3]);
		const receiverKeyId = this.byte2int(chunks[4]);
		this.log(`senderKeyId: ${senderKeyId}`, true);
		this.log(`receiverKeyId: ${receiverKeyId}`, true);

		const selfKey = this.getE2EESelfKeyData(this.mid);
		let privK = Buffer.from(selfKey.privKey, "base64");
		let pubK;

		if (toType === 0) {
			pubK = this.getE2EELocalPublicKey(
				isSelf ? to : _from,
				isSelf ? receiverKeyId : senderKeyId,
			);
		} else {
			const groupK = this.getE2EELocalPublicKey(to, receiverKeyId);
			privK = Buffer.from(groupK.privKey, "base64");
			pubK = Buffer.from(selfKey.pubKey, "base64");
			if (_from !== this.mid) {
				pubK = this.getE2EELocalPublicKey(_from, senderKeyId);
			}
		}

		let decrypted;
		if (specVersion === "2") {
			decrypted = this.decryptE2EEMessageV2(
				to,
				_from,
				chunks,
				privK,
				pubK,
				specVersion,
				contentType,
			);
		} else {
			decrypted = this.decryptE2EEMessageV1(chunks, privK, pubK);
		}

		return decrypted.text || "";
	}

	decryptE2EELocationMessage(messageObj, isSelf = true) {
		const _from = this.checkAndGetValue(messageObj, "_from", 1);
		const to = this.checkAndGetValue(messageObj, "to", 2);
		const toType = this.checkAndGetValue(messageObj, "toType", 3);
		const metadata = this.checkAndGetValue(messageObj, "contentMetadata", 18);
		const specVersion = metadata.e2eeVersion || "2";
		const contentType = this.checkAndGetValue(messageObj, "contentType", 15);
		let chunks = this.checkAndGetValue(messageObj, "chunks", 20);

		chunks = chunks.map((chunk) =>
			typeof chunk === "string" ? Buffer.from(chunk, "utf-8") : chunk
		);

		const senderKeyId = this.byte2int(chunks[3]);
		const receiverKeyId = this.byte2int(chunks[4]);
		this.log(`senderKeyId: ${senderKeyId}`, true);
		this.log(`receiverKeyId: ${receiverKeyId}`, true);

		const selfKey = this.getE2EESelfKeyData(this.mid);
		let privK = Buffer.from(selfKey.privKey, "base64");
		let pubK;

		if (toType === 0) {
			pubK = this.getE2EELocalPublicKey(
				to,
				isSelf ? receiverKeyId : senderKeyId,
			);
		} else {
			const groupK = this.getE2EELocalPublicKey(to, receiverKeyId);
			privK = Buffer.from(groupK.privKey, "base64");
			pubK = Buffer.from(selfKey.pubKey, "base64");
			if (_from !== this.mid) {
				pubK = this.getE2EELocalPublicKey(_from, senderKeyId);
			}
		}

		let decrypted;
		if (specVersion === "2") {
			decrypted = this.decryptE2EEMessageV2(
				to,
				_from,
				chunks,
				privK,
				pubK,
				specVersion,
				contentType,
			);
		} else {
			decrypted = this.decryptE2EEMessageV1(chunks, privK, pubK);
		}

		return decrypted.location || null;
	}

	decryptE2EEMessageV1(chunks, privK, pubK) {
		const salt = chunks[0];
		const message = chunks[1];
		const sign = chunks[2];
		const aesKey = this.generateSharedSecret(privK, pubK);
		const aes_key = this.getSHA256Sum(aesKey, salt, Buffer.from("Key"));
		const aes_iv = this._xor(this.getSHA256Sum(aesKey, salt, "IV"));
		const decipher = crypto.createDecipheriv("aes-256-cbc", aes_key, aes_iv);
		let decrypted = Buffer.concat([decipher.update(message), decipher.final()]);
		this.log(`decrypted: ${decrypted.toString("utf-8")}`, true);
		decrypted = this.unpad(decrypted, 16);
		return JSON.parse(decrypted.toString("utf-8"));
	}

	// 任意の補助メソッドが含まれる場合に対応するため、`TCompactProtocol` や `bin2bytes`, `getIntBytes` メソッドの実装が必要です。
}