const {asFunction} = require('awilix');

module.exports = container => {
    container.register({
        notificationCache: asFunction(({redisService}) =>
            new (require('../services/caches/notification.cache'))(redisService)
        ).singleton(),
        reactionCache: asFunction(({redisService, reactionRepo}) =>
            new (require('../services/caches/reaction.cache'))({
                reactionRepo,
                redisService
            })
        ).singleton()
    });
};
