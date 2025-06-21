const {connectDB, disconnectDB, isDBConnected} = require('./services/db.service');
const {gracefulShutdown} = require('./utils/system.utils');
const container = require("./container");

/**
 * Start the application by connecting to the database and cache service then starting the server.
 */
async function startServer({server, port = 5000}) {
    try {
        const cacheService = container.resolve('cacheService');
        // Connect to both cache service and DB concurrently
        await Promise.all([connectDB(), cacheService.connect()]);

        // Start the server once both services are connected
        server.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

        console.log('Database and cache service connected successfully.');
    } catch (error) {
        console.error('Error during startup:', error);

        // Gracefully shut down the system if any of the connections fail
        await gracefulShutdown(async () => {
            console.log('Cleaning up resources before shutting down...');

            // Check if cache and DB are connected and close them if necessary
            if (await cacheService.isConnected()) await cacheService.close();
            if (await isDBConnected()) await disconnectDB();
        });
    }
}

module.exports = startServer;
