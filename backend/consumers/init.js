const container = require("@/container");
const initAvatarPlaceholderConsumer = require("@/consumers/avatarPlaceholder/initAvatarPlaceholder.consumer")

/**
 * Initializes all Redis-based pub/sub or queue consumers in the application.
 *
 * This function resolves each consumer from the dependency injection container
 * and passes it to its respective initialization function.
 *
 * Add new consumers here to ensure they're registered on application startup.
 *
 * @returns {Promise<void>} A promise that resolves when all consumers are initialized.
 */
module.exports = async () => {
    await Promise.all([
        initAvatarPlaceholderConsumer(container.resolve('avatarPlaceholderConsumer')),
    ]);
};