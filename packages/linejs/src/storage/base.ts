export interface Storage {
	Key: string;
	Value: string | number | boolean | null | Record<string | number, any>;
}

/**
 * @classdesc Base Storage for LINE Client
 */
export abstract class BaseStorage {
	/**
	 * @description Set a value.
	 *
	 * @param {Storage["Key"]} key
	 * @param {Storage["Value"]} value
	 */
	public abstract set(
		key: Storage["Key"],
		value: Storage["Key"],
	): Promise<void>;

	/**
	 * @description Get a value.
	 *
	 * @param {Storage["Key"]} key
	 *
	 * @returns {Promise<Storage["Value"] | undefined>} value
	 */
	public abstract get(
		key: Storage["Key"],
	): Promise<Storage["Value"] | undefined>;

	/**
	 * @description Delete a value.
	 *
	 * @param {Storage["Key"]} key
	 */
	public abstract delete(key: Storage["Key"]): Promise<void>;

	/**
	 * @description Clear all data.
	 */
	public abstract clear(): Promise<void>;
}
