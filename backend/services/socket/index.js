const {Server} = require('socket.io');
const {createAdapter} = require('@socket.io/redis-adapter');
const {SOCKET_EVENTS, REDIS, getUserRoom} = require('../../constants/socket.constants');
const AppError = require('../../errors/app.error');
const config = require('../../config/config');
const httpCodes = require('../../constants/httpCodes');
const statusMessages = require('../../constants/statusMessages');
const SocketEventDispatcher = require('./socketEventDispatcher.service');
const errorCodes = require('../../constants/errorCodes');

/**
 * @class SocketService
 * @description Manages WebSocket connections using Socket.IO with Redis cluster support
 *
 * This service handles real-time communication including:
 * - Connection management
 * - Authentication
 * - Redis pub/sub integration
 * - Cluster health monitoring
 * - Degraded mode fallback
 *
 * @example
 * const socketService = new SocketService({
 *   httpServer,
 *   redisClient,
 *   onlineUserService,
 *   jwtAuthService
 * });
 * await socketService.initialize();
 */
class SocketService {
    /**
     * @private
     * @type {import('socket.io').Server}
     * @description Socket.IO server instance
     */
    #io;

    /**
     * @private
     * @type {import('ioredis').Redis}
     * @description Redis publisher client
     */
    #redisPub;

    /**
     * @private
     * @type {import('ioredis').Redis}
     * @description Redis subscriber client
     */
    #redisSub;

    /**
     * @private
     * @type {import('ioredis').Redis}
     * @description Main Redis client connection
     */
    #redisClient;

    /**
     * @private
     * @type {OnlineUserService}
     * @description Service for tracking online users
     */
    #onlineUserService;

    /**
     * @private
     * @type {JwtAuthService}
     * @description JWT authentication service
     */
    #jwtAuthService;

    /**
     * @private
     * @type {SocketEventDispatcher}
     * @description Event dispatcher for socket events
     */
    #eventDispatcher;

    /**
     * @private
     * @type {import('ioredis').Redis}
     * @description Worker subscriber connection
     */
    #workerSub;

    /**
     * @private
     * @type {boolean}
     * @description Flag indicating if service is initialized
     */
    #isInitialized = false;

    /**
     * @private
     * @type {boolean}
     * @description Flag indicating degraded mode status
     */
    #isDegraded = false;

    /**
     * @private
     * @type {number}
     * @description Count of connection retry attempts
     */
    #retryCount = 0;

    /**
     * @private
     * @type {ReturnType<NodeJS.Timeout>}
     * @description Interval for health checks in degraded mode
     */
    #healthCheckInterval;

    /**
     * @private
     * @type {{
     *      pub: 'disconnected' | 'connected' ,
     *      sub: 'disconnected' | 'connected' ,
     *      worker: 'disconnected' | 'connected'
     * }}
     * @description Tracks connection states for pub/sub/worker
     */
    #connectionStates;

    /**
     * @private
     * @type {{
     *    eventsDispatched: number,
     *    deliveryErrors: number,
     *    redisErrors: number,
     *    reconnects: number
     * }}
     * @description Service metrics and statistics
     */
    #metrics = {
        eventsDispatched: 0,
        deliveryErrors: 0,
        redisErrors: 0,
        reconnects: 0
    };

    /**
     * Creates a SocketService instance
     * @param {Object} params - Dependencies
     * @param {import('http').Server} params.httpServer - HTTP server instance
     * @param {import('redis').Redis} params.redisClient - Redis cluster client
     * @param {OnlineUserService} params.onlineUserService - Online user tracking service
     * @param {JwtAuthService} params.jwtAuthService - JWT authentication service
     * @throws {Error} If required dependencies are missing
     */
    constructor({httpServer, redisClient, onlineUserService, jwtAuthService}) {
        if (!redisClient || !onlineUserService || !jwtAuthService) {
            throw new Error('Missing required dependencies');
        }

        this.#redisClient = redisClient;
        this.#onlineUserService = onlineUserService;
        this.#jwtAuthService = jwtAuthService;

        // Create separate connections for pub/sub
        this.#redisPub = this.#createRedisConnection();
        this.#redisSub = this.#createRedisConnection();

        this.#io = new Server(httpServer, {
            transports: ['websocket'],
            perMessageDeflate: false,
            maxHttpBufferSize: 1e6,
            cors: {
                origin: config.allowedOrigins,
                methods: ['GET', 'POST'],
                credentials: true
            },
            connectionStateRecovery: {
                maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
                skipMiddlewares: true
            }
        });

        this.#connectionStates = {
            pub: 'disconnected',
            sub: 'disconnected',
            worker: 'disconnected'
        };

        this.#setupConnectionHandlers();
    }

    /**
     * @private
     * Creates a new Redis connection with error handling
     * @returns {import('ioredis').Redis} New Redis connection
     */
    #createRedisConnection() {
        const conn = this.#redisClient.duplicate();
        conn.on('error', (err) => this.#handleRedisError(err));
        return conn;
    }

    /**
     * @private
     * Sets up Redis connection event handlers
     */
    #setupConnectionHandlers() {
        this.#redisPub.on('ready', () => {
            console.log('[SocketService] Redis Pub connection ready');
            this.#retryCount = 0; // Reset on successful connection
        });

        this.#redisSub.on('ready', () => {
            console.log('[SocketService] Redis Sub connection ready');
            this.#retryCount = 0;
        });

        this.#redisClient.on('node error', (err, node) => {
            this.#metrics.redisErrors++;
            console.error(`[SocketService] Redis node error (${node}):`, err.message);
        });
    }

    /**
     * @private
     * Handles Redis connection errors
     * @param {Error} err - Redis error
     */
    #handleRedisError(err) {
        this.#metrics.redisErrors++;
        console.error('[SocketService] Redis Error:', err.message);

        if (err.message.includes('CLUSTERDOWN')) {
            this.#retryCount++;
            console.warn(`[SocketService] Redis cluster is down (attempt ${this.#retryCount})`);

            if (this.#retryCount > 5) {
                this.#enterDegradedMode();
            } else {
                setTimeout(() => this.#attemptReconnect(), 2000);
            }
        }
    }

    /**
     * @private
     * Attempts to reconnect Redis clients
     * @returns {Promise<void>}
     */
    async #attemptReconnect() {
        try {
            if (!this.#isInitialized) return;

            console.log('[SocketService] Attempting to reconnect Redis...');
            await Promise.all([
                this.#redisPub.connect(),
                this.#redisSub.connect()
            ]);
            this.#metrics.reconnects++;
            console.log('[SocketService] Redis reconnected successfully');
        } catch (err) {
            console.error('[SocketService] Reconnect failed:', err.message);
        }
    }

    /**
     * @private
     * Enters degraded mode when Redis cluster is unavailable
     */
    #enterDegradedMode() {
        if (this.#isDegraded) return;

        this.#isDegraded = true;
        console.warn('[SocketService] Entering degraded mode');

        // Switch to polling fallback
        this.#healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.#checkClusterHealth();
                if (health.status === 'healthy') {
                    console.log('[SocketService] Cluster recovered, exiting degraded mode');
                    this.#isDegraded = false;
                    clearInterval(this.#healthCheckInterval);
                    await this.#attemptReconnect();
                }
            } catch (err) {
                console.error('[SocketService] Health check failed:', err.message);
            }
        }, 5000);
    }

    /**
     * @private
     * Checks Redis cluster health status
     * @returns {Promise<
     * {status: 'healthy' | 'degraded' | 'unhealthy', nodes: number} |
     * {status: 'unhealthy', error?: string}
     * >} Health status object
     */
    async #checkClusterHealth() {
        try {
            await this.#redisClient.ping();
            const info = await this.#redisClient.cluster('INFO');
            return {
                status: info.includes('cluster_state:ok') ? 'healthy' : 'degraded',
                nodes: (await this.#redisClient.cluster('NODES')).split('\n').length
            };
        } catch (err) {
            return {status: 'unhealthy', error: err.message};
        }
    }

    /**
     * @private
     * Sets up Socket.IO event listeners
     */
    #setupListeners() {
        this.#io.on(SOCKET_EVENTS.CONNECTION, async (socket) => {
            const userId = socket.userId;
            if (!userId) return socket.disconnect(true);

            await this.#onlineUserService.add(userId, socket.id);
            socket.join(getUserRoom(userId));

            socket.setMaxListeners(20);

            socket.on(SOCKET_EVENTS.DISCONNECT, () => {
                this.#onlineUserService.remove(userId, socket.id);
            });

            socket.on('error', (err) => {
                console.error(`[SocketService] Socket error for user ${userId}:`, err.message);
            });
        });
    }

    /**
     * @private
     * Sets up Socket.IO authentication middleware
     */
    #setupMiddleware() {
        this.#io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth?.token;
                if (!token) {
                    return next(new AppError(
                        statusMessages.ACCESS_TOKEN_NOT_PROVIDED,
                        httpCodes.UNAUTHORIZED.code,
                        errorCodes.ACCESS_TOKEN_FAILED
                    ));
                }

                const {userId} = await this.#jwtAuthService.verifyAccessToken(token);
                socket.userId = userId;
                next();
            } catch (err) {
                console.error('[SocketService] Socket.IO Auth Error', err);
                next(err);
            }
        });
    }

    /**
     * @private
     * Ensures Redis connection is ready
     * @param {import('ioredis').Redis} redisConn - Redis connection
     * @param {string} type - Connection type ('pub', 'sub', or 'worker')
     * @returns {Promise<void>}
     * @throws {Error} If connection type is invalid or connection fails
     */
    async #ensureConnection(redisConn, type) {
        if (!['pub', 'sub', 'worker'].includes(type)) {
            throw new Error('Invalid connection type');
        }

        // Return if already ready or connecting
        if (this.#connectionStates[type] === 'ready') return;
        if (this.#connectionStates[type] === 'connecting') {
            await new Promise((resolve) => {
                const interval = setInterval(() => {
                    if (this.#connectionStates[type] === 'ready') {
                        clearInterval(interval);
                        resolve();
                    } else if (this.#connectionStates[type] === 'error') {
                        clearInterval(interval);
                        resolve();
                    }
                }, 100);
            });
            return;
        }

        this.#connectionStates[type] = 'connecting';
        try {
            // Skip if already connected
            if (redisConn.status === 'ready') {
                this.#connectionStates[type] = 'ready';
                return;
            }

            // Handle connecting state
            if (redisConn.status === 'connecting') {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        redisConn.removeAllListeners();
                        reject(new Error('Redis connection timeout'));
                    }, 10000);

                    redisConn.once('ready', () => {
                        clearTimeout(timeout);
                        this.#connectionStates[type] = 'ready';
                        resolve();
                    });

                    redisConn.once('error', (err) => {
                        clearTimeout(timeout);
                        this.#connectionStates[type] = 'error';
                        reject(err);
                    });
                });
                return;
            }

            // New connection attempt
            await redisConn.connect();
            await redisConn.cluster('INFO');
            this.#connectionStates[type] = 'ready';
        } catch (err) {
            this.#connectionStates[type] = 'error';
            if (!err.message.includes('already connected')) {
                throw err;
            }
            this.#connectionStates[type] = 'ready';
        }
    }

    /**
     * Initializes the SocketService
     * @returns {Promise<void>}
     * @throws {Error} If initialization fails
     */
    async initialize() {
        if (this.#isInitialized) {
            console.warn('[SocketService] Already initialized');
            return;
        }

        try {
            console.log('[SocketService] Initializing...');

            // Wait for main client to be ready with timeout
            if (this.#redisClient.status !== 'ready') {
                await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => {
                        reject(new Error('Redis connection timeout'));
                    }, 15000);

                    const check = () => {
                        if (this.#redisClient.status === 'ready') {
                            clearTimeout(timeout);
                            resolve();
                        } else if (this.#redisClient.status === 'end') {
                            clearTimeout(timeout);
                            reject(new Error('Redis connection failed'));
                        } else {
                            setTimeout(check, 100);
                        }
                    };
                    check();
                });
            }

            // Connect pub/sub connections sequentially
            await this.#ensureConnection(this.#redisPub, 'pub');
            await this.#ensureConnection(this.#redisSub, 'sub');

            // Setup Socket.IO Redis adapter with hash tags
            this.#io.adapter(createAdapter(this.#redisPub, this.#redisSub, {
                key: `{socket.io}:${config.env}:notify`, // Added hash tags
                requestsTimeout: 10000 // Increased timeout
            }));

            this.#setupMiddleware();
            this.#setupListeners();

            // Initialize event bridge
            this.#eventDispatcher = new SocketEventDispatcher(this.#io);
            this.#workerSub = this.#createRedisConnection();
            await this.#ensureConnection(this.#workerSub, 'worker');
            await this.#workerSub.subscribe(REDIS.CHANNELS.SOCKET_EVENTS);

            this.#workerSub.on('message', (channel, message) => {
                this.#metrics.eventsDispatched++;
                if (channel === REDIS.CHANNELS.SOCKET_EVENTS) {
                    try {
                        const event = JSON.parse(message);
                        this.#eventDispatcher.dispatch(event);
                    } catch (err) {
                        this.#metrics.deliveryErrors++;
                        console.error('[SocketService] Error processing socket event:', err);
                    }
                }
            });

            this.#isInitialized = true;
            console.log('[SocketService] Initialized with Redis Cluster adapter');
        } catch (err) {
            console.error('[SocketService] Initialization failed:', err);
            await this.disconnect();
            throw err;
        }
    }

    /**
     * Disconnects all connections and cleans up resources
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (!this.#isInitialized) return;

        console.log('[SocketService] Disconnecting...');
        const disconnectTasks = [];

        if (this.#workerSub) {
            disconnectTasks.push(
                this.#workerSub.unsubscribe()
                    .then(() => this.#workerSub.quit())
                    .catch(err => console.error('[SocketService] WorkerSub disconnect error:', err))
            );
        }

        if (this.#redisPub) {
            disconnectTasks.push(
                this.#redisPub.quit()
                    .catch(err => console.error('[SocketService] RedisPub disconnect error:', err))
            );
        }

        if (this.#redisSub) {
            disconnectTasks.push(
                this.#redisSub.quit()
                    .catch(err => console.error('[SocketService] RedisSub disconnect error:', err))
            );
        }

        if (this.#io) {
            disconnectTasks.push(new Promise(resolve => {
                this.#io.close(() => {
                    console.log('[SocketService] Socket.IO server closed');
                    resolve();
                });
            }));
        }

        if (this.#healthCheckInterval) {
            clearInterval(this.#healthCheckInterval);
        }

        await Promise.all(disconnectTasks);
        this.#isInitialized = false;
        console.log('[SocketService] Disconnected cleanly');
    }

    /**
     * Checks if all connections are active
     * @returns {boolean} True if all connections are ready
     */
    isConnected() {
        return this.#isInitialized &&
            this.#redisPub?.status === 'ready' &&
            this.#redisSub?.status === 'ready' &&
            this.#workerSub?.status === 'ready';
    }

    /**
     * Gets current service metrics
     * @returns {{
     *    eventsDispatched: number,
     *    deliveryErrors: number,
     *    redisErrors: number,
     *    reconnects: number,
     *    status: 'connected' | 'disconnected',
     *    degradedMode: boolean
     * }} Metrics object
     */
    getMetrics() {
        return {
            ...this.#metrics,
            status: this.isConnected() ? 'connected' : 'disconnected',
            degradedMode: this.#isDegraded
        };
    }

    /**
     * Gets Redis cluster health status
     * @returns {Promise<
     * {status: 'healthy' | 'degraded' | 'unhealthy', nodes: number} |
     * {status: 'unhealthy', error?: string}
     * >} Health status object
     */
    async getClusterHealth() {
        return this.#checkClusterHealth();
    }
}

module.exports = SocketService;
