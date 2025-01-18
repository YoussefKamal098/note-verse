class CacheService {
    constructor(uri = 'cacheDatabase', storeName = 'cache') {
        this.dbName = uri;
        this.storeName = storeName;
        this.db = null;
    }

    // Ensure connection is only established once
    async connect() {
        if (this.db) {
            return this.db;
        }

        const request = indexedDB.open(this.dbName, 1);

        return new Promise((resolve, reject) => {
            request.onerror = () => reject(new Error('Failed to open IndexedDB'));

            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName, {keyPath: 'key'});
                }
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
        });
    }

    async save(key, data) {
        const db = await this.connect();
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const request = store.put({key, data});

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(new Error(`Failed to save cache for key ${key}! ${e.target.error}`));
        });
    }

    async get(key) {
        const db = await this.connect();
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const request = store.get(key);

            request.onsuccess = () => resolve(request.result ? request.result.data : null);
            request.onerror = (e) => reject(new Error(`Failed to retrieve cache for key ${key}! ${e.target.error}`));
        });
    }

    async delete(key) {
        const db = await this.connect();
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const request = store.delete(key);

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(new Error(`Failed to delete cache for key ${key}! ${e.target.error}`));
        });
    }

    async flushDB() {
        const db = await this.connect();
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);

        return new Promise((resolve, reject) => {
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = (e) => reject(new Error(`Failed to clear all cache! ${e.target.error}`));
        });
    }
}

const cacheService = new CacheService();
export default cacheService;
