import { BaseStorage, type Storage } from "./base.ts";

/**
 * @lassdesc Mmemory Storage for LINE Client
 * @constructor
 */
export class MemoryStorage extends BaseStorage {
	/**
	 * Create a new MemoryStorage instance, with initial data.
	 *
	 * @param {Record<Storage["Key"], Storage["Value"]>} [extendData] - Initial data to be stored in the memory storage.
	 */
	constructor(extendData?: Record<Storage["Key"], Storage["Value"]>) {
		super();
		if (extendData) {
			this.data = new Map(Object.entries(extendData));
		}
	}

	private data: Map<Storage["Key"], Storage["Value"]> = new Map();

	public async set(
		key: Storage["Key"],
		value: Storage["Value"],
	): Promise<void> {
		this.data.set(key, value);
	}

	public async get(
		key: Storage["Key"],
	): Promise<Storage["Value"] | undefined> {
		return this.data.get(key);
	}

	public async delete(key: Storage["Key"]): Promise<void> {
		this.data.delete(key);
	}

	public async clear(): Promise<void> {
		this.data.clear();
	}

	public getAll(): Record<Storage["Key"], Storage["Value"]> {
		return Object.fromEntries(this.data);
	}
}
