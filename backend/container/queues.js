const {asFunction} = require('awilix');

module.exports = container => {
    container.register({
        notificationQueue: asFunction(({redisService}) =>
            new (require('../queues/notification.queue'))({redisClient: redisService.client})
        ).singleton()
    })
};
