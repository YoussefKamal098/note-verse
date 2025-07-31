const {asFunction} = require('awilix');

module.exports = container => {
    container.register({
        avatarPlaceholderConsumer: asFunction(({redisService}) =>
            new (require('@/consumers/avatarPlaceholder/avatarPlaceholder.consumer'))({redisClient: redisService.client})
        ).singleton(),
    })
};
