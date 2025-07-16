const {asFunction} = require('awilix');

module.exports = container => {
    container.register({
        notificationBatcher: asFunction(({notificationQueue}) =>
            new (require('../services/batchers/notification.batcher'))({
                notificationQueue
            })
        ).singleton(),
    });
};
