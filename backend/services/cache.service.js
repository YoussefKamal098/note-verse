const redis = require('redis');
const {timeUnit, time} = require('shared-utils/date.utils');

class CacheService {
    #client;
    #ttl;
    #connectPromise = null;

    constructor({
                    url = 'redis://127.0.0.1:6379',
                    ttl = time({[timeUnit.HOUR]: 1}),
                } = {}) {
        this.#ttl = ttl;

        this.#client = redis.createClient({url});

        this.#client.on('error', (err) => {
            console.error('[Redis Error]', err);
        });

        this.#client.on('connect', () => {
            console.log('[Redis] connecting...');
        });

        this.#client.on('ready', () => {
            console.log('[Redis] ready ✅');
        });

        this.#client.on('end', () => {
            console.log('[Redis] disconnected ❌');
        });
    }

    // central connection guard
    async #ensureConnection() {
        if (this.#client.isOpen) return;

        if (!this.#connectPromise) {
            this.#connectPromise = this.#client.connect().catch((err) => {
                this.#connectPromise = null;
                throw err;
            });
        }

        return this.#connectPromise;
    }

    // Generic executor (removes duplication)
    async #exec(command) {
        await this.#ensureConnection();
        return command();
    }

    // ======================
    // CACHE METHODS
    // ======================

    async get(key) {
        return this.#exec(() => this.#client.get(key));
    }

    async set(key, value, ttl = this.#ttl) {
        return this.#exec(() =>
            this.#client.set(key, value, {EX: ttl})
        );
    }

    async delete(key) {
        return this.#exec(() => this.#client.del(key));
    }

    async increment(key) {
        return this.#exec(() => this.#client.incr(key));
    }

    async expire(key, ttl = this.#ttl) {
        return this.#exec(() => this.#client.expire(key, ttl));
    }

    async flush() {
        return this.#exec(() => this.#client.flushDb());
    }

    async clearByPattern(pattern) {
        return this.#exec(async () => {
            const SCAN_COUNT = 100;
            let cursor = 0;

            do {
                const {cursor: nextCursor, keys} = await this.#client.scan(cursor, {
                    MATCH: pattern,
                    COUNT: SCAN_COUNT,
                });

                cursor = Number(nextCursor);

                if (keys.length) {
                    await this.#client.del(keys);
                }

            } while (cursor !== 0);
        });
    }

    async close() {
        if (this.#client.isOpen) {
            await this.#client.quit();
        }
    }
}

module.exports = CacheService;
