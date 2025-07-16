const config = require('@/config/config');
const {EventEmitter} = require('events');

/**
 * @class RedisService
 * @extends EventEmitter
 * @description Redis client wrapper with enhanced cluster support, connection management, and safety features
 *
 * Features:
 * - Automatic reconnection with backoff
 * - Cluster node error handling
 * - Safe production guards
 * - Comprehensive health checks
 * - TTL-based operations
 **/
class RedisService extends EventEmitter {
    /** @private @type {RedisClient} */
    #client;
    /** @private @type {number} */
    #ttl;
    /** @private @type {Console|Logger} */
    #logger;
    /** @private @type {boolean} */
    #isConnected = false;
    /** @private @type {number} */
    #reconnectAttempts = 0;
    /** @private @type {number} */
    #maxReconnectAttempts = 5;
    /** @private @type {number} */
    #reconnectDelay = 1000;

    /**
     * Creates RedisService instance
     * @param {Object} config - Configuration
     * @param {import('ioredis').Redis} config.redisClient - Configured Redis client
     * @param {number} [config.ttl=3600] - Default TTL in seconds
     * @param {Console|Logger} [config.logger=console] - Logger instance
     * @param {number} [config.maxReconnectAttempts=5] - Max reconnection attempts
     * @param {number} [config.reconnectDelay=1000] - Delay between reconnects (ms)
     * @throws {Error} If redisClient is missing
     */
    constructor({
                    redisClient,
                    ttl = 3600, // one hour
                    logger = console,
                    maxReconnectAttempts = 5,
                    reconnectDelay = 1000
                } = {}) {
        super();
        if (!redisClient) {
            throw new Error('Redis client is required');
        }

        this.#client = redisClient;
        this.#ttl = ttl;
        this.#logger = logger;
        this.#maxReconnectAttempts = maxReconnectAttempts;
        this.#reconnectDelay = reconnectDelay;

        this.#setupEventHandlers();
    }

    /**
     * Get underlying Redis client
     * @returns {import('ioredis').Redis}
     */
    get client() {
        return this.#client;
    }

    /** @private */
    #setupEventHandlers() {
        this.#client.on('connect', () => {
            this.#isConnected = true;
            this.#reconnectAttempts = 0;
            this.#logger.info('[RedisService] Redis Cluster connected');
            this.emit('connected');
        });

        this.#client.on('ready', () => {
            this.#logger.debug('[RedisService] Redis Cluster ready');
            this.emit('ready');
        });

        this.#client.on('error', (err) => {
            this.#logger.error('[RedisService] Redis Cluster error:', err.message);
            this.emit('error', err);
        });

        this.#client.on('end', () => {
            if (this.#isConnected) {
                this.#isConnected = false;
                this.#logger.warn('[RedisService] Redis Cluster connection closed');
                this.emit('disconnected');
            }
        });

        this.#client.on('reconnecting', () => {
            this.#logger.info('[RedisService] Attempting to reconnect to Redis Cluster...');
            this.emit('reconnecting');
        });

        this.#client.on('node error', (err, node) => {
            this.#logger.error(`[RedisService] Redis node error (${node}):`, err.message);
            this.emit('node:error', err, node);
        });
    }

    /**
     * @private
     * Ensures active connection with retry logic
     * @returns {Promise<boolean>}
     * @throws {Error} When max reconnection attempts exceeded
     */
    async #ensureConnection() {
        if (this.#isConnected) return true;

        try {
            await this.#client.ping();
            this.#isConnected = true;
            return true;
        } catch (err) {
            if (this.#reconnectAttempts < this.#maxReconnectAttempts) {
                this.#reconnectAttempts++;
                this.#logger.warn(`[RedisService] Reconnection attempt ${this.#reconnectAttempts}/${this.#maxReconnectAttempts}`);
                await new Promise(resolve => setTimeout(resolve, this.#reconnectDelay));
                return this.#ensureConnection();
            }
            throw new Error(`[RedisService] Failed to connect after ${this.#maxReconnectAttempts} attempts`);
        }
    }

    /**
     * Establishes Redis connection
     * @returns {Promise<void>}
     * @throws {Error} If connection fails
     */
    async connect() {
        try {
            if (this.#isConnected) {
                this.#logger.warn('[RedisService] Already connected to Redis Cluster');
                return;
            }

            await this.#ensureConnection();
        } catch (err) {
            this.#logger.error('[RedisService] Failed to connect to Redis Cluster:', err.message);
            throw err;
        }
    }

    /**
     * Gets value by key
     * @param {string} key - Redis key
     * @returns {Promise<string|null>} Stored value or null
     */
    async get(key) {
        await this.#ensureConnection();
        return this.#client.get(key);
    }

    /**
     * Sets value with optional TTL
     * @param {string} key - Redis key
     * @param {string} value - Value to store
     * @param {number} [ttl] - TTL in seconds (defaults to instance TTL)
     * @returns {Promise<'OK'>}
     */
    async set(key, value, ttl = this.#ttl) {
        await this.#ensureConnection();
        const options = ttl ? ['EX', ttl] : [];
        return this.#client.set(key, value, ...options);
    }

    /**
     * Sets key to hold the string value with expiration
     * @param {string} key - Redis key
     * @param {number} ttl - Time to live in seconds
     * @param {string} value - Value to store
     * @returns {Promise<'OK'>}
     */
    async setex(key, ttl, value) {
        await this.#ensureConnection();
        return this.#client.setex(key, ttl, value);
    }

    /**
     * Sets multiple keys to multiple values
     * @param {...Array<string>} items - Alternating keys and values (e.g., [key1, val1, key2, val2])
     * @returns {Promise<'OK'>}
     */
    async mset(...items) {
        await this.#ensureConnection();
        if (items.length % 2 !== 0) {
            throw new Error("mset expects an even number of arguments [key1, val1, key2, val2...]");
        }

        const pipeline = this.#client.pipeline();
        for (let i = 0; i < items.length; i += 2) {
            const key = items[i];
            const val = items[i + 1];
            pipeline.set(key, val);
        }
        await pipeline.exec();
        return 'OK';
    }

    /**
     * Gets values of multiple keys
     * @param {...string} keys - Keys to retrieve
     * @returns {Promise<Array<string|null>>} Array of values
     */
    async mget(...keys) {
        await this.#ensureConnection();
        if (keys.length === 1) {
            return [await this.#client.get(keys[0])];
        }

        const pipeline = this.#client.pipeline();
        keys.forEach(k => pipeline.get(k));
        const results = await pipeline.exec();
        return results.map(([err, val]) => err ? null : val);
    }

    /**
     * Deletes one or more keys
     * @param {...string} keys - Keys to delete
     * @returns {Promise<number>} Number of keys removed
     */
    async del(...keys) {
        await this.#ensureConnection();
        if (keys.length === 1) {
            return this.#client.del(keys[0]);
        }

        const pipeline = this.#client.pipeline();
        keys.forEach(key => pipeline.del(key));
        const results = await pipeline.exec();
        return results.filter(([err]) => !err).length;
    }

    /**
     * Adds members to a set
     * @param {string} key - Set key
     * @param {...string} members - Members to add
     * @returns {Promise<number>} Number of members added
     */
    async sadd(key, ...members) {
        await this.#ensureConnection();
        return this.#client.sadd(key, members);
    }

    /**
     * Removes members from a set
     * @param {string} key - Set key
     * @param {...string} members - Members to remove
     * @returns {Promise<number>} Number of members removed
     */
    async srem(key, ...members) {
        await this.#ensureConnection();
        return this.#client.srem(key, members);
    }

    /**
     * Gets all members of a set
     * @param {string} key - Set key
     * @returns {Promise<string[]>} Array of members
     */
    async smembers(key) {
        await this.#ensureConnection();
        return this.#client.smembers(key);
    }

    /**
     * Sets field in hash to value
     * @param {string} key - Hash key
     * @param {string} field - Field name
     * @param {string} value - Field value
     * @returns {Promise<number>} 1 if new field, 0 if updated
     */
    async hset(key, field, value) {
        await this.#ensureConnection();
        return this.#client.hset(key, field, value);
    }

    /**
     * Sets multiple hash fields
     * @param {string} key - Hash key
     * @param {Object} obj - Field-value pairs
     * @returns {Promise<'OK'>}
     */
    async hmset(key, obj) {
        await this.#ensureConnection();
        const args = Object.entries(obj).flat();
        return this.#client.hmset(key, ...args);
    }

    /**
     * Checks if key exists
     * @param {string} key - Key to check
     * @returns {Promise<number>} 1 if exists, 0 if not
     */
    async exists(key) {
        return await this.#client.exists(key);
    }

    /**
     * Sets key expiration
     * @param {string} key - Key to set expiration for
     * @param {number} seconds - Time to live in seconds
     * @returns {Promise<number>} 1 if timeout set, 0 if key doesn't exist
     */
    async expire(key, seconds) {
        await this.#client.expire(key, seconds);
    }

    /**
     * Gets key time to live
     * @param {string} key - Key to check
     * @returns {Promise<number>} TTL in seconds, -2 if key doesn't exist, -1 if no expiry
     */
    async ttl(key) {
        return await this.#client.ttl(key);
    }

    /**
     * Checks if member is in set
     * @param {string} key - Set key
     * @param {string} member - Member to check
     * @returns {Promise<number>} 1 if member exists, 0 if not
     */
    async sismember(key, member) {
        return await this.#client.sismember(key, member);
    }

    /**
     * Gets set cardinality
     * @param {string} key - Set key
     * @returns {Promise<number>} Number of members
     */
    async scard(key) {
        return await this.#client.scard(key);
    }

    /**
     * Gets hash field value
     * @param {string} key - Hash key
     * @param {string} field - Field name
     * @returns {Promise<string|null>} Field value or null
     */
    async hget(key, field) {
        return await this.#client.hget(key, field);
    }

    /**
     * Gets multiple hash field values
     * @param {string} key - Hash key
     * @param {...string} fields - Fields to get
     * @returns {Promise<Array<string|null>>} Array of values
     */
    async hmget(key, ...fields) {
        return await this.#client.hmget(key, fields);
    }

    /**
     * Gets all fields and values in hash
     * @param {string} key - Hash key
     * @returns {Promise<Object>} Object with field-value pairs
     */
    async hgetall(key) {
        return await this.#client.hgetall(key);
    }

    /**
     * Deletes hash fields
     * @param {string} key - Hash key
     * @param {...string} fields - Fields to delete
     * @returns {Promise<number>} Number of fields removed
     */
    async hdel(key, ...fields) {
        return await this.#client.hdel(key, fields);
    }

    /**
     * Checks if hash field exists
     * @param {string} key - Hash key
     * @param {string} field - Field to check
     * @returns {Promise<number>} 1 if exists, 0 if not
     */
    async hexists(key, field) {
        return await this.#client.hexists(key, field);
    }

    /**
     * Increments hash field by integer
     * @param {string} key - Hash key
     * @param {string} field - Field to increment
     * @param {number} increment - Increment value
     * @returns {Promise<number>} New field value
     */
    async hincrby(key, field, increment) {
        return await this.#client.hincrby(key, field, increment);
    }

    /**
     * Prepends elements to list
     * @param {string} key - List key
     * @param {...string} values - Values to prepend
     * @returns {Promise<number>} New list length
     */
    async lpush(key, ...values) {
        return await this.#client.lpush(key, values);
    }

    /**
     * Appends elements to list
     * @param {string} key - List key
     * @param {...string} values - Values to append
     * @returns {Promise<number>} New list length
     */
    async rpush(key, ...values) {
        return await this.#client.rpush(key, values);
    }

    /**
     * Removes and gets first element in list
     * @param {string} key - List key
     * @returns {Promise<string|null>} First element or null
     */
    async lpop(key) {
        return await this.#client.lpop(key);
    }

    /**
     * Removes and gets last element in list
     * @param {string} key - List key
     * @returns {Promise<string|null>} Last element or null
     */
    async rpop(key) {
        return await this.#client.rpop(key);
    }

    /**
     * Gets list elements between indexes
     * @param {string} key - List key
     * @param {number} start - Start index (0-based)
     * @param {number} stop - Stop index (-1 for end)
     * @returns {Promise<string[]>} Array of elements
     */
    async lrange(key, start, stop) {
        return await this.#client.lrange(key, start, stop);
    }

    /**
     * Gets list length
     * @param {string} key - List key
     * @returns {Promise<number>} List length
     */
    async llen(key) {
        return await this.#client.llen(key);
    }

    /**
     * Increments integer key
     * @param {string} key - Key to increment
     * @returns {Promise<number>} New value
     */
    async incr(key) {
        return await this.#client.incr(key);
    }

    /**
     * Increments key by integer
     * @param {string} key - Key to increment
     * @param {number} increment - Increment value
     * @returns {Promise<number>} New value
     */
    async incrby(key, increment) {
        return await this.#client.incrby(key, increment);
    }

    /**
     * Decrements integer key
     * @param {string} key - Key to decrement
     * @returns {Promise<number>} New value
     */
    async decr(key) {
        return await this.#client.decr(key);
    }

    /**
     * Decrements key by integer
     * @param {string} key - Key to decrement
     * @param {number} decrement - Decrement value
     * @returns {Promise<number>} New value
     */
    async decrby(key, decrement) {
        return await this.#client.decrby(key, decrement);
    }

    /**
     * Finds keys matching pattern
     * @param {string} pattern - Glob-style pattern
     * @returns {Promise<string[]>} Matching keys
     */
    async keys(pattern) {
        const masters = this.#client.nodes('master');
        const allKeys = new Set();

        for (const node of masters) {
            const keys = await node.keys(pattern);
            keys.forEach(k => allKeys.add(k));
        }

        return [...allKeys];
    }

    /**
     * Deletes keys matching pattern
     * @param {string} pattern - Glob-style pattern
     * @returns {Promise<number>} Number of keys deleted
     */
    /**
     * Deletes keys matching pattern using pipelining for efficiency
     * @param {string} pattern - Glob-style pattern
     * @returns {Promise<number>} Number of keys deleted
     */
    async clearKeysByPattern(pattern) {
        const masters = this.#client.nodes('master');
        const SCAN_COUNT = 100;
        let totalDeleted = 0;

        for (const node of masters) {
            let cursor = '0';

            do {
                const [nextCursor, keys] = await node.scan(cursor, 'MATCH', pattern, 'COUNT', SCAN_COUNT);

                if (keys.length > 0) {
                    const pipeline = node.pipeline();
                    keys.forEach(key => pipeline.del(key));
                    const results = await pipeline.exec();

                    totalDeleted += results.filter(([err]) => !err).length;
                }

                cursor = nextCursor;
            } while (cursor !== '0');
        }

        return totalDeleted;
    }

    /**
     * Gets Redis cluster info
     * @returns {Promise<string>} Cluster info string
     */
    async clusterInfo() {
        await this.#ensureConnection();
        return this.#client.cluster('INFO');
    }

    /**
     * Gets cluster node information from all master nodes
     *
     * @returns {Promise<string[]>} Array of cluster node info strings (one per master node)
     *
     * Each string represents the output of the `CLUSTER NODES` command
     * from a different master node in the Redis cluster.
     */
    async clusterNodes() {
        const masters = this.#client.nodes('master');
        const nodesData = [];

        for (const node of masters) {
            const data = await node.cluster('NODES');
            nodesData.push(data);
        }

        return nodesData;
    }

    /**
     * Finds all keys matching pattern
     * @param {string} pattern - Glob-style pattern
     * @param {number} [count=100] - Keys per iteration
     * @returns {Promise<string[]>} All matching keys
     */
    async scanKeys(pattern, count = 100) {
        await this.#ensureConnection();
        const masters = this.#client.nodes('master');
        const found = new Set();

        for (const node of masters) {
            let cursor = '0';
            do {
                const [nextCursor, keys] = await node.scan(
                    cursor,
                    'MATCH',
                    pattern,
                    'COUNT',
                    count
                );
                keys.forEach(k => found.add(k));
                cursor = nextCursor;
            } while (cursor !== '0');
        }

        return [...found];
    }

    /**
     * Flushes current DB across Redis Cluster nodes
     * @param {boolean} [safe=true] - Prevent in production
     * @returns {Promise<'OK'>}
     */
    async flushdb(safe = true) {
        await this.#ensureConnection();
        if (safe && config.env === 'production') {
            throw new Error('[RedisService] flushdb is disabled in production');
        }

        const masters = this.#client.nodes('master');
        for (const node of masters) {
            await node.flushdb();
        }

        return 'OK';
    }

    /**
     * Flushes all DBs across Redis Cluster nodes
     * @param {boolean} [safe=true] - Prevent in production
     * @returns {Promise<'OK'>}
     */
    async flushall(safe = true) {
        await this.#ensureConnection();
        if (safe && config.env === 'production') {
            throw new Error('[RedisService] flushall is disabled in production');
        }

        const masters = this.#client.nodes('master');
        for (const node of masters) {
            await node.flushall();
        }

        return 'OK';
    }

    /**
     * Checks if connected to Redis
     * @returns {boolean} True if connected and ready
     */
    isConnected() {
        return this.#isConnected && this.#client.status === 'ready';
    }

    /**
     * Pings Redis server
     * @returns {Promise<string|boolean>} 'PONG' if connected, false otherwise
     */
    async ping() {
        try {
            await this.#ensureConnection();
            return this.#client.ping();
        } catch (err) {
            return false;
        }
    }

    /**
     * Closes Redis connection
     * @returns {Promise<void>}
     */
    async close() {
        try {
            if (this.#isConnected) {
                await this.#client.quit();
                this.#isConnected = false;
                this.#logger.info('[RedisService] Redis Cluster disconnected');
                this.emit('disconnected');
            }
        } catch (err) {
            this.#logger.error('[RedisService] Error disconnecting Redis Cluster:', err.message);
            throw err;
        }
    }

    /**
     * Performs health check
     * @returns {Promise<Object>} Health status
     * @property {string} status - 'healthy' or 'unhealthy'
     * @property {boolean} ping - Whether ping succeeded
     * @property {string} [clusterState] - Cluster state if clustered
     * @property {number} [nodes] - Node count if clustered
     * @property {string} [error] - Error message if unhealthy
     */
    async healthCheck() {
        try {
            const pingResponse = await this.ping();
            const info = await this.clusterInfo();
            return {
                status: 'healthy',
                ping: pingResponse === 'PONG',
                clusterState: info.includes('cluster_state:ok') ? 'ok' : 'degraded',
                nodes: (await this.clusterNodes()).length
            };
        } catch (err) {
            return {
                status: 'unhealthy',
                error: err.message
            };
        }
    }
}

module.exports = RedisService;
