const {asFunction} = require('awilix');

module.exports = container => {
    container.register({
        notificationEmitter: asFunction(({redisService, onlineUserService}) =>
            new (require('../services/emitters/notification.emitter'))({
                redisClient: redisService.client,
                onlineUserService
            })
        ).singleton(),
    });
};
