require('module-alias/register');
const http = require('http');
const intSocketService = require('./services/socket/init');
const container = require('./container');
const shutdownHandler = require('./utils/shutdownHandler');
const {connectDB} = require("@/services/db.service");
const config = require('./config/config');

async function startSocketServer(port = 6000) {
    try {
        // Create plain HTTP server (no Express needed for pure WebSockets)
        const httpServer = http.createServer((req, res) => {
            if (req.url === '/status') {
                res.writeHead(200);
                res.end('OK');
            }
        });

        // Initialize services
        const redisService = container.resolve('redisService');
        const cacheService = container.resolve('cacheService');

        // Connect to all dependencies
        await Promise.all([
            connectDB(),
            cacheService.connect(),
            redisService.connect()
        ]);

        // Initialize Socket.IO service
        await intSocketService({httpServer});

        // Start server
        httpServer.listen(port, () => {
            console.log(`🟢 WebSocket server is running on ws://localhost:${port}`);
            console.log(`   (HTTP fallback available on http://localhost:${port})`);
        });

        return httpServer;
    } catch (err) {
        console.error('❌ WebSocket server failed to start:', err);
        await shutdownHandler();
        process.exit(1); // Ensure process exits on failure
    }
}

// Start the server with proper error handling
startSocketServer(config.socketPort)
    .then(() => console.log('WebSocket server started successfully'))
    .catch(err => console.error('Failed to start WebSocket server:', err));