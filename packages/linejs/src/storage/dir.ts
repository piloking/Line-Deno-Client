import * as fs from "node:fs";
import { BaseStorage, type Storage } from "./base.ts";

/**
 * @classdesc Directory Storage for LINE Client
 * @constructor
 */
export class DirStorage extends BaseStorage {
	private path: string;
	private keyIdPair: Array<{ key: Storage["Key"]; id: number }> = [];
	/**
	 * @description Construct a DirStorage with the given directory path.
	 *
	 * @param {string} path - The path to the directory.
	 */
	constructor(path: string) {
		super();
		if (!path.endsWith("/")) {
			path = path + "/";
		}
		this.path = path;
		try {
			fs.readdirSync(this.path);
			this.keyIdPair = JSON.parse(
				fs.readFileSync(
					this.path + "keyIdPair.json",
					"utf-8",
				) as string,
			);
		} catch (_e) {
			fs.mkdirSync(this.path);
		}
	}

	private setNewKeyId(key: Storage["Key"], id: number): void {
		this.keyIdPair.push({ key, id });
		fs.writeFileSync(
			this.path + "keyIdPair.json",
			JSON.stringify(this.keyIdPair),
			"utf-8",
		);
	}
	private getIdFromKey(key: Storage["Key"]): number {
		let lastKeyId = 0;
		let id = 0;
		this.keyIdPair.forEach((e) => {
			if (lastKeyId < e.id) lastKeyId = e.id;
			if (e.key === key) {
				id = e.id;
			}
		});
		if (id) {
			return id;
		} else {
			lastKeyId++;
			this.setNewKeyId(key, lastKeyId);
			return lastKeyId;
		}
	}

	public async set(
		key: Storage["Key"],
		value: Storage["Value"],
	): Promise<void> {
		await new Promise((resolve) =>
			fs.writeFile(this.getPath(key), this.getTypedValue(value), {
				encoding: "utf-8",
			}, resolve)
		);
	}

	public async get(
		key: Storage["Key"],
	): Promise<Storage["Value"] | undefined> {
		try {
			return this.getValue(
				await new Promise<string>((resolve) =>
					fs.readFile(
						this.getPath(key),
						"utf-8",
						(_e, data) => resolve(data),
					)
				),
			);
		} catch (_e) {
			/* Do Nothing */
		}
	}

	public async delete(key: Storage["Key"]): Promise<void> {
		try {
			await new Promise((resolve) => {
				fs.rm(this.getPath(key), resolve);
			});
		} catch (_e) {
			/* Do Nothing */
		}
	}

	public async clear(): Promise<void> {
		await new Promise<unknown>((resolve) => {
			fs.readdir(this.path, (_e, files) => {
				resolve(Promise.all(files.map<Promise<unknown>>((e) => {
					return new Promise((resolve) => {
						try {
							fs.rm(e, resolve);
						} catch (_e) {
							resolve(null);
						}
					});
				})));
			});
		});
	}

	public getPath(key: string): string {
		if (key.includes("/")) {
			throw new Error('Wrong dirStorage key "/"');
		}
		return this.path + this.getIdFromKey(key).toString(16) + ".txt";
	}

	public getTypedValue(obj: Storage["Value"]): string {
		switch (typeof obj) {
			case "string":
				return "s" + obj.toString();
			case "number":
				return "n" + obj.toString();
			case "boolean":
				return "b" + obj ? "T" : "";
			default:
				return "x";
		}
	}

	public getValue(value: string): Storage["Value"] {
		switch (value[0]) {
			case "s":
				return value.substring(1);
			case "n":
				return Number(value.substring(1));
			case "b":
				return Boolean(value.substring(1));
			case "x":
				return null;
			default:
				return null;
		}
	}
}
