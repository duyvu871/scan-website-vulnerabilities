import electron from 'electron';
import path from 'path';
import fs from 'fs';
import logger from 'electron-log';

/**
 * Options for configuring the data store.
 */
export interface StoreOptions {
    /**
     * The name of the configuration file (without extension).
     * Example: 'user-preferences'
     */
    configName: string;
    /**
     * Default values to use if the configuration file is empty or doesn't exist.
     */
    defaults: Record<string, unknown>;
}

/**
 * A simple persistent data store using JSON files.
 */
class Store<StoreItemType extends unknown> {
    private path: string;
    private data: Record<string, StoreItemType>;

    /**
     * Creates a new Store instance.
     * @param {StoreOptions} opts - Configuration options.
     */
    constructor(opts: StoreOptions) {
        // Get the user data path based on the current process (main or renderer)
        const userDataPath = (electron.app).getPath('userData');
        // Construct the full path to the configuration file
        this.path = path.join(userDataPath, `${opts.configName}.json`);

        // Load data from the file or use defaults if it doesn't exist
        this.data = parseDataFile(this.path, opts.defaults);
    }

    /**
     * Gets a value from the store.
     * @param {string} key - The key of the value to retrieve.
     * @returns {unknown} - The value associated with the key, or undefined if the key doesn't exist.
     */
    get<T extends StoreItemType>(key: string): T {
        return this.data[key] as T;
    }

    get_all(): Record<string, StoreItemType> {
        return this.data;
    }

    /**
     * Sets a value in the store.
     * @param {string} key - The key of the value to set.
     * @param {T} val - The value to set.
     * @returns {T | null} - The value that was set, or null if an error occurred.
     */
    set<T extends StoreItemType>(key: string, val: T): T | null {
        try {
            this.data[key] = val;

            // Write the data to the file synchronously to ensure data persistence
            fs.writeFileSync(this.path, JSON.stringify(this.data));
            logger.info(`Successfully wrote data to ${this.path}`); // Log successful write

            return val;
        } catch (error: any) {
            logger.error(`Error writing data to ${this.path}:`, error); // Log the error
            return null;
        }
    }

    /**
     * Deletes a value from the store.
     * @param {string} key - The key of the value to delete.
     * @returns {boolean} - True if the value was deleted successfully, false otherwise.
     */
    delete(key: string): boolean {
        try {
            if (key in this.data) {
                delete this.data[key];
                fs.writeFileSync(this.path, JSON.stringify(this.data));
                logger.info(`Successfully deleted key '${key}' from ${this.path}`);
                return true;
            }
            return false; // Key not found
        } catch (error: any) {
            logger.error(`Error deleting key '${key}' from ${this.path}:`, error);
            return false;
        }
    }

    /**
     * Checks if a key exists in the store.
     * @param {string} key - The key to check.
     * @returns {boolean} - True if the key exists, false otherwise.
     */
    has(key: string): boolean {
        return key in this.data;
    }

    /**
     * Clears all data from the store.
     * @returns {boolean} - True if the store was cleared successfully, false otherwise.
     */
    clear(): boolean {
        try {
            this.data = {};
            fs.writeFileSync(this.path, JSON.stringify(this.data));
            logger.info(`Successfully cleared data from ${this.path}`);
            return true;
        } catch (error: any) {
            logger.error(`Error clearing data from ${this.path}:`, error);
            return false;
        }
    }
}

/**
 * Parses a JSON data file and returns the parsed object.
 * @param {string} filePath - The path to the JSON file.
 * @param {any} defaults - Default values to use if the file is empty or doesn't exist.
 * @returns {any} - The parsed JSON object, or the default values if the file is invalid or doesn't exist.
 */
function parseDataFile(filePath: string, defaults: any): any {
    try {
        if (!fs.existsSync(filePath)) {
            logger.warn(`Data file ${filePath} not found. Using defaults.`);
            fs.writeFileSync(filePath, JSON.stringify(defaults));
            // return defaults;
        }
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        logger.warn(`Error reading data file ${filePath}:`, error);
        return defaults;
    }
}

// Export the Store class
export default Store;