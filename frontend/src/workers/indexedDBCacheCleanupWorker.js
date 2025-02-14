/* eslint-env worker */
/* eslint-disable no-restricted-globals */
import sizeof from 'object-sizeof';

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
const DEFAULT_OPTIONS = Object.freeze({
    cleanupThreshold: 0.75,  // Cleanup when storage exceeds 75% of quota
    cleanupInterval: 60000,  // Cleanup interval in milliseconds (1 min)
    debug: false,            // Enable verbose logging for debugging; set to true to see detailed logs.
    batchSize: 200,          // Maximum number of entries to a process per batch
});

// Interval timer ID for periodic cleanup
let timerId = null;

/**
 * Opens the IndexedDB database and returns a promise that resolves with the database instance.
 * @param {Object} dbConfig - The database configuration.
 * @returns {Promise<IDBDatabase>} - Promise resolving with the database instance.
 */
function openDatabase(dbConfig) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbConfig.name, dbConfig.version);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(new Error(`IndexedDB Error: ${request.error}`));
    });
}

/**
 * Processes expired entries by deleting those records whose "expires" field
 * is less than the current time. Deletion is done in batches up to a maximum
 * of `batchSize` entries. This version uses synchronous cursor iteration within
 * a single transaction to ensure that all matching records are processed.
 *
 * @param {IDBDatabase} db - The open IndexedDB database.
 * @param {Object} dbConfig - The database configuration.
 * @param {number} batchSize - Maximum number of records to delete in one batch.
 * @returns {Promise<{deletedCount: number, keys: Array}>} A promise that resolves with an object containing:
 * - deletedCount: total number of deleted entries.
 * - keys: an array of primary keys of the removed entries.
 */
function processExpiredEntries(db, dbConfig, batchSize) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(dbConfig.storeName, "readwrite");
        const store = transaction.objectStore(dbConfig.storeName);
        const index = store.index("expires");
        const range = IDBKeyRange.upperBound(Date.now()); // Get records where `expires` is in the past

        let deletedCount = 0;
        const removedKeys = [];
        const cursorRequest = index.openCursor(range);

        cursorRequest.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor && deletedCount < batchSize) {
                // Delete the current record.
                cursor.delete();
                // Save the primary key of the record being deleted.
                removedKeys.push(cursor.primaryKey);
                deletedCount++;
                // Continue with the next record.
                cursor.continue();
            } else {
                // No more records or batch limit reached.
                resolve({deletedCount, keys: removedKeys});
            }
        };

        transaction.onerror = () => reject(new Error(`Transaction failed: ${transaction.error}`));
    });
}

/**
 * Enforces storage quota limits by deleting low-priority entries if the estimated storage usage
 * exceeds a defined threshold (cleanupThreshold * quota). This function estimates the size of each entry
 * by converting it to a JSON string and calculating its byte length using a Blob.
 * It uses synchronous cursor iteration within a single transaction (via onsuccess callbacks) to process
 * up to a maximum of `batchSize` entries.
 *
 * @param {IDBDatabase} db - The open IndexedDB database.
 * @param {Object} dbConfig - The database configuration.
 * @param {string} dbConfig.storeName - The object store name.
 * @param {Object} options - The option object.
 * @param {number} options.cleanupThreshold - The fraction of quota above which cleanup occurs.
 * @param {number} options.batchSize - Maximum number of entries to process in one batch.
 * @returns {Promise<{deletedCount: number, keys: Array}>} A promise that resolves with an object containing:
 * - deletedCount: number of entries processed.
 * - keys: an array of primary keys of the removed entries.
 */
async function enforceStorageQuota(db, dbConfig, {cleanupThreshold, batchSize}) {
    try {
        const {usage, quota} = await navigator.storage.estimate();
        if (usage <= quota * cleanupThreshold) {
            return {deletedCount: 0, keys: []};
        }

        const bytesToFree = usage - quota * cleanupThreshold;
        const transaction = db.transaction(dbConfig.storeName, "readwrite");
        const store = transaction.objectStore(dbConfig.storeName);
        // Retrieve an index on the 'hits_lastAccessed' field to allow efficient queries based on access frequency.
        const index = store.index("hits_lastAccessed");

        let bytesFreed = 0;
        let deletedCount = 0;
        const removedKeys = [];

        return new Promise((resolve, reject) => {
            index.openCursor().onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && deletedCount < batchSize && bytesFreed < bytesToFree) {
                    try {
                        // Estimate the entry size using TextEncoder.
                        const keySize = sizeof(cursor.key);
                        const valueSize = sizeof(cursor.value);
                        const entrySize = keySize + valueSize;
                        // Delete the record and add the estimated entry size.
                        cursor.delete();
                        // Save the primary key after deletion.
                        removedKeys.push(cursor.primaryKey);
                        bytesFreed += entrySize;
                        deletedCount++;
                        cursor.continue();
                    } catch (error) {
                        console.error("Error estimating entry size:", error);
                    }
                } else {
                    resolve({deletedCount, keys: removedKeys});
                }
            };

            transaction.onerror = () => reject(new Error(`Transaction failed: ${transaction.error}`));
        });
    } catch (error) {
        console.error("Storage estimation failed:", error);
        return {deletedCount: 0, keys: []};
    }
}

/**
 * Performs cleanup of expired and excess entries in IndexedDB.
 * @param {Object} dbConfig - Database configuration.
 * @param {Object} options - Cleanup options.
 */
async function performCleanup(dbConfig, options) {
    try {
        const db = await openDatabase(dbConfig);
        const {
            deletedCount: expiredDeleted,
            keys: expiredKeys,
        } = await processExpiredEntries(db, dbConfig, options.batchSize);
        const {
            deletedCount: evicted_by_size_policy,
            keys: evictedKeys,
        } = await enforceStorageQuota(db, dbConfig, options);
        db.close();

        self.postMessage({
            status: "SUCCESS",
            expiredDeleted,
            expiredKeys,
            evicted_by_size_policy,
            evictedKeys,
            timestamp: Date.now(),
        });
    } catch (error) {
        self.postMessage({
            status: "ERROR",
            error: error.message,
            timestamp: Date.now(),
        });
    }
}

/**
 * Handles messages received by the worker.
 */
self.addEventListener("message", async (e) => {
    const {action, dbConfig: customDbConfig, options: customOptions} = e.data;
    const options = {...DEFAULT_OPTIONS, ...customOptions};
    
    if (options.debug) {
        console.log("Worker received message:", e.data);
    }

    if (action === "INIT") {
        const dbConfig = {...DEFAULT_DB_CONFIG, ...customDbConfig};

        if (timerId !== null) clearInterval(timerId);

        await performCleanup(dbConfig, options);
        timerId = setInterval(() => performCleanup(dbConfig, options), options.cleanupInterval);
    } else if (action === "TERMINATE") {
        if (timerId !== null) clearInterval(timerId);
        self.close();
    }
});
