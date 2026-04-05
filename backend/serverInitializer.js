const {connectDB} = require('./services/db.service');
const shutdownHandler = require('./utils/shutdownHandler');
const container = require("./container");

/**
 * Start the application by connecting to the database and caache service then starting the server.
 */
async function startServer({server: expressApp, port = 5000}) {
    try {
        // const cacheService = container.resolve('cacheService');
        const redisService = container.resolve('redisService');

        // Connect to both cache service and DB concurrently
        await Promise.all([connectDB(), redisService.connect()]);

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
