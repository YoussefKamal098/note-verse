const {asClass} = require('awilix');

module.exports = container => {
    container.register({
        avatarPlaceholderConsumerHandler: asClass(require('@/consumers/avatarPlaceholder/avatarPlaceholder.consumer.handler')).singleton(),
    })
};
