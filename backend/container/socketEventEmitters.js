const {asFunction} = require('awilix');

module.exports = container => {
    container.register({
        notificationEmitter: asFunction(({redisService, onlineUserService}) =>
            new (require('@/services/emitters/notification.emitter'))({
                redisClient: redisService.client,
                onlineUserService
            })
        ).singleton(),
        userRoomEmitter: asFunction(({redisService}) =>
            new (require('@/services/emitters/userRoom.emitter'))({
                redisClient: redisService.client
            })
        ).singleton(),
        noteRoomEmitter: asFunction(({redisService, onlineNoteService}) =>
            new (require('@/services/emitters/noteRoom.emitter'))({
                redisClient: redisService.client,
                onlineNoteService
            })
        ).singleton(),
        noteTypingEmitter: asFunction(({redisService}) =>
            new (require('@/services/emitters/noteTyping.emitter'))({
                redisClient: redisService.client
            })
        ).singleton()
    });
};
