const SocketService = require('@/services/socket');
const container = require("@/container");

/**
 * Initializes and configures the SocketService.
 * @param {Object} options
 * @param {import('http').Server} options.httpServer
 * @returns {Promise<SocketService>}
 */
async function init({httpServer}) {
    const redisService = container.resolve('redisService');
    const onlineUserService = container.resolve('onlineUserService');
    const noteRoomSocket = container.resolve('noteRoomSocket');
    const noteTypingSocket = container.resolve('noteTypingSocket');
    const userRoomSocket = container.resolve('userRoomSocket');
    const jwtAuthService = container.resolve('jwtAuthService');

    const socketService = new SocketService({
        redisClient: redisService.client,
        httpServer,
        onlineUserService,
        jwtAuthService
    });

    await socketService.registerSocketModules([noteRoomSocket, noteTypingSocket, userRoomSocket]).initialize();
    return socketService;
}

module.exports = init;
