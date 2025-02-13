import {compareDates, time, timeFromNow, timeUnit} from "shared-utils/date.utils";

/**
 * Default IndexedDB configuration (Immutable)
 * @constant {Object}
 */
const DEFAULT_DB_CONFIG = Object.freeze({
    name: "cacheDB",      // Database name
    version: 1,           // Database version
    storeName: "cache",   // Object store name
});

/**
 * Default cleanup options (Immutable)
 * @constant {Object}
 */
const DEFAULT_OPTION = Object.freeze({
    cleanupThreshold: 0.75,  // Cleanup when storage exceeds 75% of quota
    cleanupInterval: 60000,  // Cleanup interval in milliseconds (1 min)
    batchSize: 200,          // Maximum number of entries to a process per batch
    defaultTTL: time({[timeUnit.DAY]: 7}), // The default time-to-live (TTL) for cache entries is set to 7 days.
    debug: false,            // Enable verbose logging for debugging; set to true to see detailed logs.
});

// Validation limits for cleanupThreshold.
const MIN_CLEANUP_THRESHOLD = 0.1;
const MAX_CLEANUP_THRESHOLD = 1;

/**
 * Manages connection and upgrades to the IndexedDB database.
 */
class IndexedDBManager {
    #dbName;
    #version;
    #storeName;
    #db;

    /**
     * Creates a new IndexedDBManager instance with customizable database parameters.
     * @param {Object} [options={}] - Configuration options that merge with {@link DEFAULT_DB_CONFIG}
     * @param {string} [options.dbName=DEFAULT_DB_CONFIG.name] - Name for the IndexedDB database.
     *                           Uses {@link DEFAULT_DB_CONFIG.name} when not specified.
     * @param {number} [options.version=DEFAULT_DB_CONFIG.version] - Schema version number.
     *                           Increment to trigger upgrade logic. Defaults to
     *                           {@link DEFAULT_DB_CONFIG.version}.
     * @param {string} [options.storeName=DEFAULT_DB_CONFIG.storeName] - Name for the primary
     *                           object store.Uses {@link DEFAULT_DB_CONFIG.storeName} if omitted.
     */
    constructor({
                    dbName = DEFAULT_DB_CONFIG.name,
                    version = DEFAULT_DB_CONFIG.version,
                    storeName = DEFAULT_DB_CONFIG.storeName
                } = {}) {
        this.#dbName = dbName;
        this.#version = version;
        this.#storeName = storeName;
        this.#db = null;
    }

    /**
     * Upgrades the database by creating the object store and indexes if needed.
     * Indexes:
     * - expires: for entry expiry
     * - hits: for LFU cache (access frequency)
     * - hits_lastAccessed: compound index (not used directly in this sample)
     * @param {IDBDatabase} db - The opened IndexedDB instance.
     * @private
     */
    async #upgradeDB(db) {
        if (!db.objectStoreNames.contains(this.#storeName)) {
            const store = db.createObjectStore(this.#storeName, {keyPath: "key"});
            store.createIndex("expires", "expires", {unique: false});
            store.createIndex("hits", "hits", {unique: false});
            store.createIndex("hits_lastAccessed", ["hits", "lastAccessed"], {unique: false});
        }
    }

    /**
     * Connects to the IndexedDB database.
     * @returns {Promise<IDBDatabase>} A promise that resolves with the database instance.
     */
    async connect() {
        if (this.#db) return this.#db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.#dbName, this.#version);

            request.onupgradeneeded = (event) => {
                try {
                    this.#upgradeDB(event.target.result);
                } catch (error) {
                    reject(new Error(`DB upgrade failed: ${error.message}`));
                }
            };

            request.onsuccess = () => {
                this.#db = request.result;
                this.#db.onerror = (event) => {
                    console.error("Database error:", event.target.error);
                };
                resolve(this.#db);
            };

            request.onerror = () => {
                reject(new Error(`Connection failed: ${request.error}`));
            };
        });
    }

    /**
     * Retrieves the complete database configuration snapshot for inspection or external use.
     * Provides immutable metadata about the current database connection settings, useful for:
     * - Debugging and logging purposes
     * - Worker thread configuration
     * - Database version compatibility checks
     * - Audit trails of storage parameters
     *
     * @returns {Object} Frozen configuration object containing:
     * @property {string} name - Current database name (matches constructor parameter or default "cacheDB")
     * @property {number} version - Schema version number (critical for upgrade handling)
     * @property {string} storeName - Primary object store name for cache entries
     */
    getDBConfig() {
        return Object.freeze({
            name: this.#dbName,
            version: this.#version,
            storeName: this.#storeName
        });
    }

    /**
     * Safely closes database connection if open
     * @returns {void}
     */
    close() {
        if (this.#db) {
            this.#db.close();
            this.#db = null;
        }
    }

    /**
     * Returns the object store for cache operations.
     * @param {string} [transactionMode="readwrite"] - Transaction mode.
     * @returns {Promise<IDBObjectStore>} A promise that resolves with the object store.
     */
    async getStore(transactionMode = "readwrite") {
        if (!this.#db) await this.connect();
        return this.#db
            .transaction(this.#storeName, transactionMode)
            .objectStore(this.#storeName);
    }
}

/**
 * Provides cache operations (save, get, delete, flush) using IndexedDB.
 * Updates a "hits" counter on each get operation to support LFU cache eviction.
 */
class CacheService {
    #dbManager;
    #cleanupWorker;
    #options;

    /**
     * Initializes cache service with storage backend and cleanup configuration
     * @param {IndexedDBManager} indexedDBManager - Configured database manager instance
     * @param {Object} [options={}] - Cache configuration overrides
     * @param {number} [options.cleanupThreshold=0.8] - Utilization threshold (% of maxEntries) triggering cleanup
     * @param {number} [options.cleanupInterval=60000] - Background cleanup interval in milliseconds
     * @param {number} [options.batchSize=200] - Batch size for bulk cleanup operations
     * @param {boolean} [options.debug=false] - Enable verbose logging for debugging; set to true to see detailed logs.
     */
    constructor(indexedDBManager, options = {}) {
        this.#dbManager = indexedDBManager;
        // Merge default options with any overrides.
        this.#options = {...DEFAULT_OPTION, ...options};

        // Validate cleanupThreshold.
        if (this.#options.cleanupThreshold < MIN_CLEANUP_THRESHOLD ||
            this.#options.cleanupThreshold > MAX_CLEANUP_THRESHOLD) {
            throw new RangeError(
                `cleanupThreshold must be between ${MIN_CLEANUP_THRESHOLD} and ${MAX_CLEANUP_THRESHOLD}. Received: ${this.#options.cleanupThreshold}`
            );
        }

        this.#startCleanupWorker();
    }

    /**
     * Initializes background cleanup worker that handles:
     * - Expired entry removal
     * - Size-based eviction using LFU/LRU policies
     * - Periodic cleanup based on a configured interval
     * @private
     */
    async #startCleanupWorker() {
        await this.#dbManager.connect();
        this.#cleanupWorker = new Worker(new URL('../workers/indexedDBCacheCleanupWorker.js', import.meta.url));

        this.#cleanupWorker.postMessage({
            action: 'INIT',
            dbConfig: this.#dbManager.getDBConfig(),
            options: {
                batchSize: this.#options.batchSize,
                cleanupThreshold: this.#options.cleanupThreshold,
                cleanupInterval: this.#options.cleanupInterval,
                debug: this.#options.debug,
            }
        });

        this.#cleanupWorker.onmessage = (e) => {
            const {status, timestamp, expiredDeleted, expiredKeys, evicted_by_size_policy, evictedKeys, error} = e.data;
            const timeStr = new Date(timestamp).toISOString();

            switch (status) {
                case 'SUCCESS':
                    if (!this.#options.debug)
                        break;

                    console.log(
                        `[${timeStr}] Cache cleanup successful:\n` +
                        `  - Expired entries removed: ${expiredDeleted}\n` +
                        `  - Expired keys: ${expiredKeys && expiredKeys.length ? expiredKeys.join(', ') : 'None'}\n` +
                        `  - Entries evicted by size policy: ${evicted_by_size_policy}\n` +
                        `  - Evicted keys: ${evictedKeys && evictedKeys.length ? evictedKeys.join(', ') : 'None'}`
                    );
                    break;

                case 'ERROR':
                    console.error(`[${timeStr}] Cache cleanup error:`, error);
                    break;
                default:
                    console.warn('Unknown worker message:', e.data);
            }
        };
    }

    /**
     * Writes data to the cache with a given TTL.
     * Initializes the hit counter to 0 if not previously stored.
     *
     * @param {string} key - The cache key.
     * @param {*} data - The data to cache.
     * @param {number} ttl - Time-to-live in seconds (0 for no expiry).
     * @returns {Promise<void>}
     * @private
     */
    async #handleWriteOperation(key, data, ttl) {
        const store = await this.#dbManager.getStore();

        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = (event) => {
                try {
                    const existing = event.target.result;
                    const now = Date.now();

                    const newEntry = {
                        key,
                        data,
                        expires: ttl > 0 ? timeFromNow({[timeUnit.SECOND]: ttl}).getTime() : null,
                        lastAccessed: now,
                        cachedAt: existing?.cachedAt || now,
                        hits: existing?.hits !== undefined ? (existing.hits + 1) : 0
                    };

                    const putRequest = store.put(newEntry);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                } catch (error) {
                    reject(error);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Gracefully terminates all active resources and connections in sequence:
     * 1. Signals background cleanup worker to stop operations and self-terminate
     * 2. Closes IndexedDB connection if open
     * 3. Releases internal references for garbage collection
     * @returns {void}
     *
     * @note Termination effects:
     * - Pending database operations will be aborted
     * - Active transactions will be rolled back
     * - Worker message queue will be cleared
     * - All event listeners will be removed
     */
    close() {
        // Worker termination sequence
        if (this.#cleanupWorker) {
            this.#cleanupWorker.postMessage({action: 'TERMINATE'});
            this.#cleanupWorker = null;
        }

        // Database connection cleanup
        if (this.#dbManager) {
            try {
                this.#dbManager.close();
            } catch (error) {
                throw new DOMException(
                    `Connection closure failed: ${error.message}`,
                    'InvalidStateError'
                );
            }
        }
    }

    /**
     * Saves data into the cache.
     *
     * @param {string} key - The cache key.
     * @param {*} data - The data to cache.
     * @param {number} [ttl=options.defaultTTL] - The time-to-live for the cache entry, in seconds.
     * Defaults to 604,800 seconds (1 week) if not specified.
     * A value of 0 or less indicates that the entry should not expire automatically.
     * @returns {Promise<void>}
     */
    async save(key, data, ttl = this.#options.defaultTTL) {
        try {
            return this.#handleWriteOperation(key, data, ttl);
        } catch (error) {
            console.error('Save operation failed:', error);
            throw new Error(`Failed to save entry: ${error.message}`);
        }
    }

    /**
     * Retrieves data from the cache.
     * If the entry is found and not expired, its hit count is incremented
     * and its last accessed time is updated.
     *
     * @param {string} key - The cache key.
     * @returns {Promise<*>} The cached data, or null if not found/expired.
     */
    async get(key) {
        try {
            const store = await this.#dbManager.getStore();

            return new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = (event) => {
                    try {
                        const entry = event.target.result;
                        if (!entry) {
                            resolve(null);
                            return;
                        }

                        // Check for expiration
                        if (entry.expires && compareDates(entry.expires, Date.now()) <= 0) {
                            this.delete(key)
                                .then(() => resolve(null))
                                .catch((err) => reject(err));
                            return;
                        }

                        // Update hit count and last accessed timestamp
                        const updatedEntry = {
                            ...entry,
                            hits: (entry.hits || 0) + 1,
                            lastAccessed: Date.now(),
                        };

                        const updateRequest = store.put(updatedEntry);
                        updateRequest.onsuccess = () => resolve(updatedEntry.data);
                        updateRequest.onerror = () => reject(updateRequest.error);
                    } catch (error) {
                        reject(error);
                    }
                };

                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Get operation failed:", error);
            throw new Error(`Failed to retrieve entry: ${error.message}`);
        }
    }

    /**
     * Updates an existing cache entry by setting a new TTL,
     * incrementing its hit counter, and updating its last accessed time.
     *
     * @param {string} key - The cache key.
     * @param {number} [newTtl=this.#options.defaultTTL] - The new time-to-lives for the cache entry in seconds.
     * A value of 0 or less indicates that the entry should not expire automatically.
     * @returns {Promise<void>}
     */
    async refreshEntry(key, newTtl = this.#options.defaultTTL) {
        try {
            const store = await this.#dbManager.getStore();

            return new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = (event) => {
                    try {
                        const entry = event.target.result;
                        if (!entry) {
                            reject(new Error("Key not found"));
                            return;
                        }

                        const now = Date.now();

                        const updatedEntry = {
                            ...entry,
                            expires: newTtl > 0 ? timeFromNow({[timeUnit.SECOND]: newTtl}).getTime() : null,
                            lastAccessed: now,
                            hits: (entry.hits || 0) + 1,
                        };

                        const putRequest = store.put(updatedEntry);
                        putRequest.onsuccess = () => resolve();
                        putRequest.onerror = () => reject(putRequest.error);
                    } catch (error) {
                        reject(error);
                    }
                };

                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Refresh operation failed:", error);
            throw new Error(`Failed to refresh entry: ${error.message}`);
        }
    }

    /**
     * Deletes a cache entry by key.
     *
     * @param {string} key - The cache key.
     * @returns {Promise<void>}
     */
    async delete(key) {
        try {
            const store = await this.#dbManager.getStore();
            return new Promise((resolve, reject) => {
                const request = store.get(key);
                request.onsuccess = (event) => {
                    try {
                        const entry = event.target.result;
                        if (!entry) {
                            reject(new Error("Key not found"));
                            return;
                        }

                        const deleteRequest = store.delete(key);
                        deleteRequest.onsuccess = () => resolve();
                        deleteRequest.onerror = () => reject(deleteRequest.error);
                    } catch (error) {
                        reject(error);
                    }
                };
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Delete operation failed:", error);
            throw new Error(`Failed to delete entry: ${error.message}`);
        }
    }

    /**
     * Clears the entire cache.
     *
     * @returns {Promise<void>}
     */
    async flushDB() {
        try {
            const store = await this.#dbManager.getStore();
            return new Promise((resolve, reject) => {
                const request = store.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error("Flush operation failed:", error);
            throw new Error(`Failed to clear cache: ${error.message}`);
        }
    }
}

const cacheServiceInstance = new CacheService(new IndexedDBManager({version: 3}), {debug: true});
export default cacheServiceInstance;
