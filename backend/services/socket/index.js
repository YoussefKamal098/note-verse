const {Server} = require('socket.io');
const {createAdapter} = require('@socket.io/redis-adapter');
const {SOCKET_EVENTS, getUserRoom} = require('@/constants/socket.constants');
const AppError = require('@/errors/app.error');
const config = require('@/config/config');
const httpCodes = require('@/constants/httpCodes');
const statusMessages = require('@/constants/statusMessages');
const errorCodes = require('@/constants/errorCodes');
const RedisConnectionManager = require('./redisConnectionManager');
const ClusterHealthMonitor = require('./clusterHealthMonitor');
const EventBridge = require('./eventBridge');

/**
 * @class SocketService
 * @description Manages WebSocket connections using Socket.IO with Redis cluster support
 */
class SocketService {
    /**
     * @private
     * @type {import('socket.io').Server}
     */
    #io;

    /**
     * @private
     * @type {import('ioredis').Redis}
     */
    #redisClient;

    /**
     * @private
     * @type {OnlineUserService}
     */
    #onlineUserService;

    /**
     * @private
     * @type {JwtAuthService}
     */
    #jwtAuthService;

    /**
     * @private
     * @type {ISocketModule[]}
     */
    #socketModules = [];

    /**
     * @private
     * @type {boolean}
     */
    #isInitialized = false;

    /**
     * @private
     * @type {RedisConnectionManager}
     */
    #connectionManager;

    /**
     * @private
     * @type {ClusterHealthMonitor}
     */
    #healthMonitor;

    /**
     * @private
     * @type {EventBridge}
     */
    #eventBridge;

    /**
     * @private
     * @type {{connectionCount: number}}
     */
    #metrics = {connectionCount: 0};

    /**
     * Creates a SocketService instance
     * @param {Object} params - Dependencies
     * @param {import('http').Server} params.httpServer - HTTP server
     * @param {import('ioredis').Redis} params.redisClient - Redis client
     * @param {OnlineUserService} params.onlineUserService - User tracking service
     * @param {JwtAuthService} params.jwtAuthService - JWT auth service
     * @throws {Error} If dependencies are missing
     */
    constructor({httpServer, redisClient, onlineUserService, jwtAuthService}) {
        if (!redisClient || !onlineUserService || !jwtAuthService) {
            throw new Error('[SocketService] Missing required dependencies');
        }

        this.#redisClient = redisClient;
        this.#onlineUserService = onlineUserService;
        this.#jwtAuthService = jwtAuthService;

        this.#connectionManager = new RedisConnectionManager(redisClient);
        this.#healthMonitor = new ClusterHealthMonitor(redisClient);
        this.#initializeSocketServer(httpServer);
        this.#setupConnectionHandlers();
    }

    /**
     * @private
     * Initializes Socket.IO server
     * @param {import('http').Server} httpServer - HTTP server
     */
    #initializeSocketServer(httpServer) {
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
                maxDisconnectionDuration: 2 * 60 * 1000,
                skipMiddlewares: true
            }
        });
    }

    /**
     * @private
     * Sets up connection handlers
     */
    #setupConnectionHandlers() {
        this.#connectionManager.pub.on('error', (err) => {
            if (this.#connectionManager.handleError(err) === 'clusterDown') {
                this.#handleClusterDownError();
            }
        });
    }

    /**
     * @private
     * Handles cluster down error
     */
    #handleClusterDownError() {
        if (this.#connectionManager.retryCount > 5) {
            this.#healthMonitor.enterDegradedMode();
        } else {
            this.#connectionManager.attemptReconnect();
        }
    }

    /**
     * @private
     * Sets up authentication middleware
     */
    #setupMiddleware() {
        this.#io.use(async (socket, next) => {
            try {
                await this.#authenticateSocket(socket);
                next();
            } catch (err) {
                this.#handleAuthError(err, next);
            }
        });
    }

    /**
     * @private
     * Authenticates a socket connection
     * @param {import('socket.io').Socket} socket - Socket instance
     * @returns {Promise<void>}
     */
    async #authenticateSocket(socket) {
        const token = socket.handshake.auth?.token;
        if (!token) {
            throw new AppError(
                statusMessages.ACCESS_TOKEN_NOT_PROVIDED,
                httpCodes.UNAUTHORIZED.code,
                errorCodes.ACCESS_TOKEN_FAILED
            );
        }

        const {userId} = await this.#jwtAuthService.verifyAccessToken(token);
        socket.userId = userId;
    }

    /**
     * @private
     * Handles authentication errors
     * @param {Error} err - Error object
     * @param {Function} next - Next middleware function
     */
    #handleAuthError(err, next) {
        console.error('[SocketService] Auth error', err);
        next(err);
    }

    /**
     * @private
     * Sets up socket event listeners
     */
    #setupListeners() {
        this.#io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
            this.#handleNewConnection(socket);
        });
    }

    /**
     * @private
     * Handles new socket connection
     * @param {import('socket.io').Socket} socket - Socket instance
     */
    async #handleNewConnection(socket) {
        const userId = socket.userId;
        if (!userId) return socket.disconnect(true);

        this.#metrics.connectionCount++;
        await this.#onlineUserService.add(userId, socket.id);
        socket.join(getUserRoom(userId));
        socket.setMaxListeners(20);

        this.#setupSocketEventHandlers(socket, userId);
    }

    /**
     * @private
     * Sets up socket event handlers
     * @param {import('socket.io').Socket} socket - Socket instance
     * @param {string} userId - User ID
     */
    #setupSocketEventHandlers(socket, userId) {
        socket.on(SOCKET_EVENTS.DISCONNECT, () => {
            this.#handleDisconnect(userId, socket.id);
        });

        this.#socketModules.forEach((module) => {
            module.registerSocket(socket);
        });

        socket.on('error', (err) => {
            console.error(`[Socket] Error (user ${userId}):`, err.message);
        });
    }

    /**
     * @private
     * Handles socket disconnection
     * @param {string} userId - User ID
     * @param {string} socketId - Socket ID
     */
    async #handleDisconnect(userId, socketId) {
        await this.#onlineUserService.remove(userId, socketId);
        this.#metrics.connectionCount--;
    }

    /**
     * Registers socket feature modules (e.g., NoteRoomSocket, NotificationSocket)
     * @param {ISocketModule[]} modules
     * @return SocketService
     */
    registerSocketModules(modules) {
        this.#socketModules = modules;
        return this;
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
            await this.#initializeRedisConnections();
            await this.#initializeSocketAdapter();
            this.#setupMiddleware();
            this.#setupListeners();
            await this.#initializeEventBridge();
            this.#startHealthMonitoring();
            this.#isInitialized = true;
            console.log('[SocketService] Initialized successfully');
        } catch (err) {
            await this.#handleInitializationError(err);
        }
    }

    /**
     * @private
     * Initializes Redis connections
     * @returns {Promise<void>}
     */
    async #initializeRedisConnections() {
        await this.#waitForBaseRedisConnection();
        await this.#connectionManager.ensureConnection(this.#connectionManager.pub, 'pub');
        await this.#connectionManager.ensureConnection(this.#connectionManager.sub, 'sub');
    }

    /**
     * @private
     * Waits for base Redis connection
     * @returns {Promise<void>}
     */
    async #waitForBaseRedisConnection() {
        if (this.#redisClient.status === 'ready') return;

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(
                () => reject(new Error('Redis connection timeout')),
                15000
            );

            this.#redisClient.once('ready', () => {
                clearTimeout(timeout);
                resolve();
            });

            this.#redisClient.once('error', reject);
        });
    }

    /**
     * @private
     * Initializes Socket.IO Redis adapter
     * @returns {Promise<void>}
     */
    async #initializeSocketAdapter() {
        this.#io.adapter(createAdapter(
            this.#connectionManager.pub,
            this.#connectionManager.sub,
            {
                key: `{socket.io}:${config.env}:notify`,
                requestsTimeout: 10000
            }
        ));
    }

    /**
     * @private
     * Initializes event bridge
     * @returns {Promise<void>}
     */
    async #initializeEventBridge() {
        this.#eventBridge = new EventBridge(this.#connectionManager, this.#io);
        await this.#eventBridge.initialize();
    }

    /**
     * @private
     * Starts health monitoring
     */
    #startHealthMonitoring() {
        this.#healthMonitor.startPeriodicCheck((health) => {
            if (health.status === 'healthy' && this.#healthMonitor.isDegraded) {
                this.#healthMonitor.exitDegradedMode();
                this.#connectionManager.attemptReconnect();
            }
        });
    }

    /**
     * @private
     * Handles initialization error
     * @param {Error} err - Error object
     * @returns {Promise<void>}
     */
    async #handleInitializationError(err) {
        console.error('[SocketService] Initialization failed:', err);
        await this.disconnect();
        throw err;
    }

    /**
     * Disconnects all connections
     * @returns {Promise<void>}
     */
    async disconnect() {
        if (!this.#isInitialized) return;

        console.log('[SocketService] Disconnecting...');
        await this.#connectionManager.disconnect();
        await this.#closeSocketServer();
        this.#healthMonitor.stopPeriodicCheck();
        this.#isInitialized = false;
        console.log('[SocketService] Disconnected');
    }

    /**
     * @private
     * Closes Socket.IO server
     * @returns {Promise<void>}
     */
    async #closeSocketServer() {
        return new Promise(resolve => {
            this.#io.close(() => {
                console.log('[SocketService] Socket.IO server closed');
                resolve();
            });
        });
    }

    /**
     * Checks if all connections are active
     * @returns {boolean} True if all connections are ready
     */
    isConnected() {
        return this.#isInitialized &&
            this.#connectionManager.pub?.status === 'ready' &&
            this.#connectionManager.sub?.status === 'ready' &&
            this.#connectionManager.worker?.status === 'ready';
    }

    /**
     * Gets current service metrics
     * @returns {{
     *   connectionCount: number,
     *   redisErrors: number,
     *   reconnects: number,
     *   eventsDispatched: number,
     *   deliveryErrors: number,
     *   status: string,
     *   degradedMode: boolean
     * }}
     */
    getMetrics() {
        return {
            connectionCount: this.#metrics.connectionCount,
            redisErrors: this.#connectionManager.metrics.redisErrors,
            reconnects: this.#connectionManager.metrics.reconnects,
            eventsDispatched: this.#eventBridge?.metrics.eventsDispatched || 0,
            deliveryErrors: this.#eventBridge?.metrics.deliveryErrors || 0,
            status: this.isConnected() ? 'connected' : 'disconnected',
            degradedMode: this.#healthMonitor.isDegraded
        };
    }

    /**
     * Gets Redis cluster health status
     * @returns {Promise<{status: string, nodes?: number, error?: string}>}
     */
    async getClusterHealth() {
        return this.#healthMonitor.checkHealth();
    }
}

module.exports = SocketService;
