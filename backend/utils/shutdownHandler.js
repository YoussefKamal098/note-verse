const {disconnectDB, isDBConnected} = require('../services/db.service');
const {gracefulShutdown} = require('./system.utils');
const container = require('../container');

async function shutdownServices() {
    console.log('🔄 Cleaning up resources before shutting down...');

    try {
        await gracefulShutdown(async () => {
            if (container.hasRegistration('cacheService')) {
                const cacheService = container.resolve('cacheService');
                if (cacheService?.isConnected?.() === true) {
                    await cacheService.close();
                    console.log('✅ Cache service closed.');
                }
            }

            if (container.hasRegistration('redisService')) {
                const redisService = container.resolve('redisService');
                if (redisService?.isConnected?.() === true) {
                    await redisService.close();
                    console.log('✅ Redis service closed.');
                }
            }

            if (container.hasRegistration('socketServer')) {
                const socketServer = container.resolve('socketServer');
                if (socketServer?.isConnected?.() === true) {
                    await socketServer.disconnect();
                    console.log('✅ Socket server disconnected.');
                }
            }

            if (await isDBConnected()) {
                await disconnectDB();
                console.log('✅ Database disconnected.');
            }
        });
    } catch (err) {
        console.error('❌ Error during shutdown:', err);
    }
}

module.exports = shutdownServices;
