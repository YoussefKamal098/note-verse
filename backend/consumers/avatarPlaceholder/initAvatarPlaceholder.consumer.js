const container = require('@/container');

/**
 * Initializes the avatar placeholder consumer.
 * @param {AvatarPlaceholderConsumer} consumer
 * @returns {Promise<void>}
 */
async function initAvatarPlaceholderConsumer(consumer) {
    await consumer.init();
    const avatarPlaceholderConsumerHandler = container.resolve('avatarPlaceholderConsumerHandler');

    consumer.onAvatarGenerated((payload) => {
        avatarPlaceholderConsumerHandler.handle(payload);
    });
}

module.exports = initAvatarPlaceholderConsumer;
