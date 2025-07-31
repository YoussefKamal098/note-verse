const EventEmitter = require('events');

/**
 * RedisChannelSubscriber subscribes to a Redis pub/sub channel and emits events.
 */
class RedisChannelSubscriber extends EventEmitter {
    #redisClient;
    #channel;
    #isSubscribed = false;

    /**
     * @param {object} deps
     * @param {import('ioredis').Redis} deps.redisClient - Redis client.
     * @param {string} deps.channel - Channel name to subscribe to.
     */
    constructor({redisClient, channel}) {
        super();
        this.#redisClient = redisClient.duplicate();
        this.#channel = channel;
    }

    /**
     * Initialize Redis subscription.
     */
    async init() {
        if (this.#isSubscribed) return;

        this.#redisClient.on('message', this.#handleMessage.bind(this));
        await this.#redisClient.subscribe(this.#channel);

        this.#isSubscribed = true;
        console.log(`[REDIS SUBSCRIBER] Subscribed to ${this.#channel}`);
    }

    #handleMessage(channel, message) {
        if (channel !== this.#channel) return;

        try {
            const data = JSON.parse(message);
            this.emit('message', data);
        } catch (error) {
            console.error(`[REDIS SUBSCRIBER] Failed to parse message on ${channel}:`, error);
        }
    }

    /**
     * Gracefully unsubscribe.
     */
    async shutdown() {
        if (!this.#isSubscribed) return;

        await this.#redisClient.unsubscribe(this.#channel);
        await this.#redisClient.quit();
        this.#isSubscribed = false;

        console.log(`[REDIS SUBSCRIBER] Unsubscribed from ${this.#channel}`);
    }
}

module.exports = RedisChannelSubscriber;
