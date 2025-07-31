const RedisChannelSubscriber = require('../redisChannelSubscriber');
const REDIS = require('@/constants/redis.constants');
const AvatarGenerationTypes = require('@/enums/avatarGenerationTypes.enum');

/**
 * AvatarPlaceholderConsumer listens to avatar placeholder generation messages.
 */
class AvatarPlaceholderConsumer {
    /**
     * @private
     * @type {RedisChannelSubscriber}
     */
    #subscriber;

    /**
     * @param {object} deps
     * @param {import('ioredis').Redis} deps.redisClient
     */
    constructor({redisClient}) {
        this.#subscriber = new RedisChannelSubscriber({
            redisClient,
            channel: REDIS.CHANNELS.AVATAR_GENERATED(AvatarGenerationTypes.PLACEHOLDER),
        });
    }

    /**
     * Initialize Redis subscription.
     */
    async init() {
        await this.#subscriber.init();
    }

    /**
     * Register a listener for avatar generation messages.
     * @param {(payload: AvatarGeneratedPayload) => void} callback
     */
    onAvatarGenerated(callback) {
        this.#subscriber.on('message', callback);
    }

    /**
     * Graceful shutdown.
     */
    async shutdown() {
        await this.#subscriber.shutdown();
    }
}

module.exports = AvatarPlaceholderConsumer;
