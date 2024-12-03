import * as fs from "node:fs";
import { BaseStorage, type Storage } from "./base.ts";

/**
 * @classdesc File Storage for LINE Client
 * @constructor
 */
export class FileStorage extends BaseStorage {
	/**
	 * @description Construct a FileStorage with the given path and data.
	 *
	 * @param {string} path - The path to the file.
	 * @param {string} [extendData] - The data to extend the file with. If the file does not exist, it will be created with the given data. If the file does exist, the data will be appended to the file. If no data is given, the file will be created with an empty object.
	 */
	constructor(
		private path: string,
		extendData?: string,
	) {
		super();

		try {
			fs.readFileSync(this.path, "utf-8");

			if (extendData) {
				fs.writeFileSync(this.path, extendData, "utf-8");
			}
		} catch (_e) {
			fs.writeFileSync(this.path, extendData || "{}", "utf-8");
		}
	}

	public async set(
		key: Storage["Key"],
		value: Storage["Value"],
	): Promise<void> {
		const data = await this.getAll();

		data[key] = value;
		await new Promise((resolve) => {
			fs.writeFile(this.path, JSON.stringify(data), "utf-8", resolve);
		});
	}

	public async get(
		key: Storage["Key"],
	): Promise<Storage["Value"] | undefined> {
		const data = await this.getAll();
		return data[key];
	}

	public async delete(key: Storage["Key"]): Promise<void> {
		const data = await this.getAll();

		delete data[key];
		await new Promise((resolve) => {
			fs.writeFile(this.path, JSON.stringify(data), "utf-8", resolve);
		});
	}

	public async clear(): Promise<void> {
		await new Promise((resolve) => {
			fs.writeFile(this.path, "{}", "utf-8", resolve);
		});
	}

	public async getAll(): Promise<Record<Storage["Key"], Storage["Value"]>> {
		const file = await new Promise<string>((resolve) => {
			fs.readFile(this.path, "utf-8", (_e, data) => resolve(data));
		});
		return JSON.parse(file || "{}");
	}
}
