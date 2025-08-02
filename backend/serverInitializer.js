const {connectDB} = require('./services/db.service');
const shutdownHandler = require('./utils/shutdownHandler');
const initConsumers = require("./consumers/init");
const container = require("./container");

/**
 * Start the application by connecting to the database and caache service then starting the server.
 */
async function startServer({server: expressApp, port = 5000}) {
    try {
        const cacheService = container.resolve('cacheService');
        const redisService = container.resolve('redisService');

        // Connect to both cache service and DB concurrently
        await Promise.all([connectDB(), cacheService.connect(), redisService.connect()]);

        // Initialize background job consumers (e.g., BullMQ workers or Redis pub/sub subscribers).
        // These consumers listen for asynchronous events and process background tasks.
        // Example: After user registration, a job is queued to generate an avatar placeholder.
        // Once generated, the consumer listens for the Redis `avatar_generated:placeholder` channel
        // and updates the user's profile with the generated avatar.
        await initConsumers();

        // Start the server once both services are connected
        expressApp.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

        console.log('Database and cache service connected successfully.');
    } catch (error) {
        console.error('❌ Error during startup:', error);
        await shutdownHandler();
    }
}

module.exports = startServer;
