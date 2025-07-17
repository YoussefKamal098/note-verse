/**
 * @class RedisConnectionManager
 * @description Manages Redis connections including pub/sub and worker connections
 */
class RedisConnectionManager {
    /**
     * @private
     * @type {import('ioredis').Redis}
     */
    #redisClient;

    /**
     * @private
     * @type {import('ioredis').Redis}
     */
    #pub;

    /**
     * @private
     * @type {import('ioredis').Redis}
     */
    #sub;

    /**
     * @private
     * @type {import('ioredis').Redis}
     */
    #worker;

    /**
     * @private
     * @type {{redisErrors: number, reconnects: number}}
     */
    #metrics = {redisErrors: 0, reconnects: 0};

    /**
     * @private
     * @type {number}
     */
    #retryCount = 0;

    /**
     * @constructor
     * @param {import('ioredis').Redis} redisClient - Base Redis client
     */
    constructor(redisClient) {
        this.#redisClient = redisClient;
        this.#pub = this.#createRedisConnection();
        this.#sub = this.#createRedisConnection();
        this.#worker = this.#createRedisConnection();
        this.#setupConnectionHandlers();
    }

    /**
     * Gets the publisher connection
     * @returns {import('ioredis').Redis}
     */
    get pub() {
        return this.#pub;
    }

    /**
     * Gets the subscriber connection
     * @returns {import('ioredis').Redis}
     */
    get sub() {
        return this.#sub;
    }

    /**
     * Gets the worker connection
     * @returns {import('ioredis').Redis}
     */
    get worker() {
        return this.#worker;
    }

    /**
     * Gets connection metrics
     * @returns {{redisErrors: number, reconnects: number}}
     */
    get metrics() {
        return this.#metrics;
    }

    /**
     * Gets retry count
     * @returns {number}
     */
    get retryCount() {
        return this.#retryCount;
    }

    /**
     * @private
     * Creates a new Redis connection
     * @returns {import('ioredis').Redis}
     */
    #createRedisConnection() {
        const conn = this.#redisClient.duplicate();
        conn.on('error', (err) => this.handleError(err));
        return conn;
    }

    /**
     * @private
     * Sets up connection event handlers
     */
    #setupConnectionHandlers() {
        this.#pub.on('ready', () => {
            console.log('[RedisConnection] Pub connection ready');
            this.#retryCount = 0;
        });

        this.#sub.on('ready', () => {
            console.log('[RedisConnection] Sub connection ready');
            this.#retryCount = 0;
        });
    }

    /**
     * Handles Redis connection errors
     * @param {Error} err - Error object
     * @returns {string} Error type
     */
    handleError(err) {
        this.#metrics.redisErrors++;
        console.error('[RedisConnection] Redis Error:', err.message);

        if (err.message.includes('CLUSTERDOWN')) {
            this.#retryCount++;
            console.warn(`[RedisConnection] Redis cluster down (attempt ${this.#retryCount})`);
            return 'clusterDown';
        }
        return 'otherError';
    }

    /**
     * Attempts to reconnect Redis clients
     * @returns {Promise<boolean>} True if reconnection succeeded
     */
    async attemptReconnect() {
        try {
            console.log('[RedisConnection] Attempting Redis reconnect...');
            await Promise.all([
                this.ensureConnection(this.#pub, 'pub'),
                this.ensureConnection(this.#sub, 'sub')
            ]);
            this.#metrics.reconnects++;
            console.log('[RedisConnection] Redis reconnected successfully');
            return true;
        } catch (err) {
            console.error('[RedisConnection] Reconnect failed:', err.message);
            return false;
        }
    }

    /**
     * Ensures a Redis connection is ready
     * @param {import('ioredis').Redis} conn - Redis connection
     * @param {string} type - Connection type
     * @returns {Promise<void>}
     */
    async ensureConnection(conn, type) {
        if (conn.status === 'ready') return;

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(
                () => reject(new Error(`Redis connection timeout (${type})`)),
                10000
            );

            const handleReady = () => {
                clearTimeout(timeout);
                resolve();
            };

            const handleError = (err) => {
                clearTimeout(timeout);
                reject(err);
            };

            conn.once('ready', handleReady);
            conn.once('error', handleError);

            if (conn.status === 'connecting') return;
            conn.connect().catch(handleError);
        });
    }

    /**
     * Disconnects all Redis connections
     * @returns {Promise<void>}
     */
    async disconnect() {
        const tasks = [];
        if (this.#worker) tasks.push(this.#worker.quit().catch(console.error));
        if (this.#pub) tasks.push(this.#pub.quit().catch(console.error));
        if (this.#sub) tasks.push(this.#sub.quit().catch(console.error));
        await Promise.all(tasks);
    }
}

module.exports = RedisConnectionManager;
