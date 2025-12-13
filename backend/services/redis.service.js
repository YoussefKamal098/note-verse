const crc16 = require('crc').crc16;
const {EventEmitter} = require('events');
const config = require('@/config/config');

function computeRedisSlot(key) {
    let s = key.indexOf('{');
    if (s > -1) {
        const e = key.indexOf('}', s + 1);
        if (e > -1) {
            key = key.substring(s + 1, e);
        }
    }
    return crc16(key) % 16384;
}

/**
 * @class RedisService
 * @abstract EventEmitter
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
    /** @private
     *  @type {import('ioredis').Cluster}
     *  */
    #client;
    /** @private
     * @type {number}
     * */
    #ttl;
    /** @private
     * @type {Console|Logger}
     * */
    #logger;
    /** @private
     * @type {boolean}
     * */
    #isConnected = false;
    /** @private
     * @type {number}
     * */
    #reconnectAttempts = 0;
    /** @private
     *  @type {number}
     *  */
    #maxReconnectAttempts = 5;
    /** @private
     * @type {number}
     * */
    #reconnectDelay = 1000;

    /**
     * Creates RedisService instance
     * @param {Object} config - Configuration
     * @param {import('ioredis').Cluster} config.redisClient - Configured Redis client
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
     * @returns {import('ioredis').Cluster}
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
     * Sets value with full Redis options support
     * @param {string} key - Redis key
     * @param {string} value - Value to store
     * @param {Object} [options] - Redis SET options
     * @param {number} [options.EX] - Expire time in seconds
     * @param {number} [options.PX] - Expire time in milliseconds
     * @param {boolean} [options.NX] - Only set if key does not exist
     * @param {boolean} [options.XX] - Only set if key exists
     * @param {boolean} [options.KEEPTTL] - Retain the time to live
     * @returns {Promise<'OK'|null>} 'OK' if set, null if condition not met
     */
    async setWithOptions(key, value, options = {}) {
        await this.#ensureConnection();

        const args = [key, value];

        // Add expiration options
        if (options.EX !== undefined) {
            args.push('EX', options.EX.toString());
        } else if (options.PX !== undefined) {
            args.push('PX', options.PX.toString());
        }

        // Add existence conditions
        if (options.NX) {
            args.push('NX');
        } else if (options.XX) {
            args.push('XX');
        }

        // Add KEEPTTL if needed
        if (options.KEEPTTL) {
            args.push('KEEPTTL');
        }

        return this.#client.set(...args);
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
     * Adds members to a sorted set with optional parameters
     *
     * @example
     * // Basic usage
     * await redis.zadd('leaderboard', 100, 'player1');
     *
     * @example
     * // With options - only add if it doesn't exist
     * await redis.zadd('leaderboard', 'NX', 100, 'player1');
     *
     * @example
     * // Multiple members with options
     * await redis.zadd('leaderboard', 'XX', 'CH', 100, 'player1', 200, 'player2');
     *
     * @param {string} key - Sorted set key
     * @param {...string|number} args - Options followed by alternating score and member pairs
     * @returns {Promise<number>} Number of members added (or changed if CH option used)
     *
     * @throws {import('ioredis').RedisError} When connection is not established
     * @throws {Error} When invalid arguments provided
     *
     * @see {@link https://redis.io/commands/zadd/|Redis ZADD Documentation}
     */
    async zadd(key, ...args) {
        await this.#ensureConnection();

        if (args.length === 0) {
            throw new Error('ZADD requires at least one score-member pair or option');
        }

        return this.#client.zadd(key, args);
    }

    /**
     * Removes and returns one or multiple random members from a set
     *
     * @example
     * // Pop single random member
     * const member = await redis.spop('users');
     *
     * @example
     * // Pop multiple random members
     * const members = await redis.spop('users', 5);
     *
     * @param {string} key - Set key
     * @param {number} [count=1] - Number of members to pop
     * @returns {Promise<string|string[]|null>} Popped member(s)
     *
     * @see {@link https://redis.io/commands/spop/|Redis SPOP Documentation}
     */
    async spop(key, count = 1) {
        await this.#ensureConnection();
        return count > 1 ? this.#client.spop(key, count) : this.#client.spop(key);
    }

    /**
     * Removes and returns members with the highest scores from sorted set
     *
     * @example
     * // Pop single highest member
     * const result = await redis.zpopmax('leaderboard');
     *
     * @example
     * // Pop multiple highest members
     * const results = await redis.zpopmax('leaderboard', 3);
     *
     * @param {string} key - Sorted set key
     * @param {number} [count=1] - Number of members to pop
     * @returns {Promise<Object[]>} Array of objects with member and score
     *
     * @see {@link https://redis.io/commands/zpopmax/|Redis ZPOPMAX Documentation}
     */
    async zpopmax(key, count = 1) {
        await this.#ensureConnection();
        return this.#client.zpopmax(key, count);
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
     * Create a Redis transaction (MULTI) for executing multiple commands atomically
     *
     * @async
     * @method multi
     * @returns {import('ioredis').ChainableCommander} Redis transaction object that allows command chaining and execution
     * @example
     * const transaction = redis.multi();
     * transaction.set('key1', 'value1');
     * transaction.get('key2');
     * await transaction.exec();
     */
    multi() {
        return this.#client.multi();
    }

    /**
     * Execute a Lua script on the Redis server
     *
     * @async
     * @method eval
     * @param {string} script - Lua script to execute
     * @param {number} numKeys - Number of keys that the script will access
     * @param {...string} args - Arguments for the script (keys followed by additional arguments)
     * @returns {Promise<*>} Result of the Lua script execution
     * @example
     * // Basic usage
     * const result = await redis.eval('return redis.call("GET", KEYS[1])', 1, 'myKey');
     *
     * @example
     * // With multiple keys and arguments
     * const result = await redis.eval(
     *   'return {KEYS[1], KEYS[2], ARGV[1], ARGV[2]}',
     *   2,
     *   'key1',
     *   'key2',
     *   'arg1',
     *   'arg2'
     * );
     *
     * @example
     * // Using with hash operations
     * const script = `
     *   local current = redis.call('HGET', KEYS[1], ARGV[1])
     *   return current or 'default'
     * `;
     * const value = await redis.eval(script, 1, 'myHash', 'fieldName');
     */
    eval(script, numKeys, ...args) {
        return this.#client.eval(script, numKeys, ...args);
    }

    /**
     * Checks if key exists
     * @param {string} key - Key to check
     * @returns {Promise<number>} 1 if exists, 0 if not
     */
    async exists(key) {
        return this.#client.exists(key);
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
        return this.#client.ttl(key);
    }

    /**
     * Checks if member is in set
     * @param {string} key - Set key
     * @param {string} member - Member to check
     * @returns {Promise<number>} 1 if member exists, 0 if not
     */
    async sismember(key, member) {
        return this.#client.sismember(key, member);
    }

    /**
     * Gets set cardinality
     * @param {string} key - Set key
     * @returns {Promise<number>} Number of members
     */
    async scard(key) {
        return this.#client.scard(key);
    }

    /**
     * Gets hash field value
     * @param {string} key - Hash key
     * @param {string} field - Field name
     * @returns {Promise<string|null>} Field value or null
     */
    async hget(key, field) {
        return this.#client.hget(key, field);
    }

    /**
     * Gets multiple hash field values
     * @param {string} key - Hash key
     * @param {...string} fields - Fields to get
     * @returns {Promise<Array<string|null>>} Array of values
     */
    async hmget(key, ...fields) {
        return this.#client.hmget(key, fields);
    }

    /**
     * Gets all fields and values in hash
     * @param {string} key - Hash key
     * @returns {Promise<Object>} Object with field-value pairs
     */
    async hgetall(key) {
        return this.#client.hgetall(key);
    }

    /**
     * Deletes hash fields
     * @param {string} key - Hash key
     * @param {...string} fields - Fields to delete
     * @returns {Promise<number>} Number of fields removed
     */
    async hdel(key, ...fields) {
        return this.#client.hdel(key, fields);
    }

    /**
     * Checks if hash field exists
     * @param {string} key - Hash key
     * @param {string} field - Field to check
     * @returns {Promise<number>} 1 if exists, 0 if not
     */
    async hexists(key, field) {
        return this.#client.hexists(key, field);
    }

    /**
     * Increments hash field by integer
     * @param {string} key - Hash key
     * @param {string} field - Field to increment
     * @param {number} increment - Increment value
     * @returns {Promise<number>} New field value
     */
    async hincrby(key, field, increment) {
        return this.#client.hincrby(key, field, increment);
    }

    /**
     * Prepends elements to list
     * @param {string} key - List key
     * @param {...string} values - Values to prepend
     * @returns {Promise<number>} New list length
     */
    async lpush(key, ...values) {
        return this.#client.lpush(key, values);
    }

    /**
     * Appends elements to list
     * @param {string} key - List key
     * @param {...string} values - Values to append
     * @returns {Promise<number>} New list length
     */
    async rpush(key, ...values) {
        return this.#client.rpush(key, values);
    }

    /**
     * Removes and gets first element in list
     * @param {string} key - List key
     * @returns {Promise<string|null>} First element or null
     */
    async lpop(key) {
        return this.#client.lpop(key);
    }

    /**
     * Removes and gets last element in list
     * @param {string} key - List key
     * @returns {Promise<string|null>} Last element or null
     */
    async rpop(key) {
        return this.#client.rpop(key);
    }

    /**
     * Gets list elements between indexes
     * @param {string} key - List key
     * @param {number} start - Start index (0-based)
     * @param {number} stop - Stop index (-1 for end)
     * @returns {Promise<string[]>} Array of elements
     */
    async lrange(key, start, stop) {
        return this.#client.lrange(key, start, stop);
    }

    /**
     * Gets list length
     * @param {string} key - List key
     * @returns {Promise<number>} List length
     */
    async llen(key) {
        return this.#client.llen(key);
    }

    /**
     * Increments integer key
     * @param {string} key - Key to increment
     * @returns {Promise<number>} New value
     */
    async incr(key) {
        return this.#client.incr(key);
    }

    /**
     * Increments key by integer
     * @param {string} key - Key to increment
     * @param {number} increment - Increment value
     * @returns {Promise<number>} New value
     */
    async incrby(key, increment) {
        return this.#client.incrby(key, increment);
    }

    /**
     * Decrements integer key
     * @param {string} key - Key to decrement
     * @returns {Promise<number>} New value
     */
    async decr(key) {
        return this.#client.decr(key);
    }

    /**
     * Decrements key by integer
     * @param {string} key - Key to decrement
     * @param {number} decrement - Decrement value
     * @returns {Promise<number>} New value
     */
    async decrby(key, decrement) {
        return this.#client.decrby(key, decrement);
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
     * Creates a Redis pipeline for batch operations.
     *
     * @returns {import('ioredis').ChainableCommander} Redis pipeline instance
     *
     * @example
     * const pipeline = redisService.pipeline();
     * pipeline.set('key1', 'val1');
     * pipeline.set('key2', 'val2');
     * await pipeline.exec();
     */
    pipeline() {
        const client = this.#client;
        const commands = [];

        /** @type {import('ioredis').ChainableCommander}*/
        const api = new Proxy({}, {
            get(_, prop) {
                if (prop === 'exec') {
                    return async () => {
                        if (commands.length === 0) return [];

                        // 1. Group commands by Redis slot
                        const groups = new Map(); // slot => [cmd, cmd, ...]

                        for (const cmd of commands) {
                            const key = cmd[1]; // key is always second argument
                            const slot = computeRedisSlot(key);

                            if (!groups.has(slot)) groups.set(slot, []);
                            groups.get(slot).push(cmd);
                        }

                        // 2. Execute each slot group in parallel
                        const promises = [...groups.values()].map(async group => {
                            const pipeline = client.pipeline();

                            for (const [command, ...args] of group) {
                                pipeline[command](...args);
                            }
                            return pipeline.exec();
                        });

                        // 3. Flatten results to match original order
                        const groupedResults = await Promise.all(promises);
                        return groupedResults.flat();
                    };
                }

                // Dynamic command wrapper
                return (...args) => {
                    commands.push([prop, ...args]);
                    return api; // allow chaining
                };
            }
        });

        return api;
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
