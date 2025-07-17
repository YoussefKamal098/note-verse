const {REDIS} = require('../../constants/socket.constants');
const SocketEventDispatcher = require('./socketEventDispatcher.service');

/**
 * @class EventBridge
 * @description Handles event dispatching between Redis and Socket.IO
 */
class EventBridge {
    /**
     * @private
     * @type {RedisConnectionManager}
     */
    #redis;

    /**
     * @private
     * @type {SocketEventDispatcher}
     */
    #eventDispatcher;

    /**
     * @private
     * @type {{eventsDispatched: number, deliveryErrors: number}}
     */
    #metrics = {eventsDispatched: 0, deliveryErrors: 0};

    /**
     * @constructor
     * @param {RedisConnectionManager} redisConnection - Redis connection manager
     * @param {import('socket.io').Server} io - Socket.IO server instance
     */
    constructor(redisConnection, io) {
        this.#redis = redisConnection;
        this.#eventDispatcher = new SocketEventDispatcher(io);
    }

    /**
     * Gets event metrics
     * @returns {{eventsDispatched: number, deliveryErrors: number}}
     */
    get metrics() {
        return this.#metrics;
    }

    /**
     * Initializes the event bridge
     * @returns {Promise<void>}
     */
    async initialize() {
        await this.#redis.ensureConnection(this.#redis.worker, 'worker');
        await this.#redis.worker.subscribe(REDIS.CHANNELS.SOCKET_EVENTS);

        this.#redis.worker.on('message', (channel, message) => {
            this.#handleIncomingMessage(channel, message);
        });
    }

    /**
     * @private
     * Handles incoming Redis messages
     * @param {string} channel - Redis channel
     * @param {string} message - Message content
     */
    #handleIncomingMessage(channel, message) {
        this.#metrics.eventsDispatched++;
        if (channel !== REDIS.CHANNELS.SOCKET_EVENTS) return;

        try {
            const event = JSON.parse(message);
            this.#eventDispatcher.dispatch(event);
        } catch (err) {
            this.#metrics.deliveryErrors++;
            console.error('[EventBridge] Event processing error:', err);
        }
    }
}

module.exports = EventBridge;
