const http = require('http');
const {connectDB} = require('./services/db.service');
const shutdownHandler = require('./utils/shutdownHandler');
const initConsumers = require("./consumers/init");
const intSocketService = require("./services/socket/init");
const container = require("./container");

/**
 * Start the application by connecting to the database and caache service then starting the server.
 */
async function startServer({server: expressApp, port = 5000}) {
    try {
        const httpServer = http.createServer(expressApp);

        const cacheService = container.resolve('cacheService');
        const redisService = container.resolve('redisService');

        await intSocketService({httpServer});
        await initConsumers();

        // Connect to both cache service and DB concurrently
        await Promise.all([connectDB(), cacheService.connect(), redisService.connect()]);
        // Start the server once both services are connected
        httpServer.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });

        console.log('Database and cache service connected successfully.');
    } catch (error) {
        console.error('❌ Error during startup:', error);
        await shutdownHandler();
    }
}

module.exports = startServer;
