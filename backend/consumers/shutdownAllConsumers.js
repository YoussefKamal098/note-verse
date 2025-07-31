const container = require("@/container");
const avatarPlaceholderConsumer = container.resolve('avatarPlaceholderConsumer');

/**
 * Gracefully shuts down all Redis-based pub/sub or queue consumers in the application.
 *
 * This function ensures that all consumers are properly closed and cleaned up,
 * preventing memory leaks, dangling connections, or unacknowledged jobs.
 *
 * Add new consumers here to ensure they are also gracefully stopped on application shutdown.
 *
 * @returns {Promise<void>} A promise that resolves when all consumers are closed.
 */
module.exports = async () => {
    await Promise.all([
        avatarPlaceholderConsumer.shutdown(),
    ]);
};
