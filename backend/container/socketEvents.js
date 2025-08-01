const {asClass} = require('awilix');

module.exports = container => {
    container.register({
        noteRoomSocket: asClass(require('@/services/socket/noteRoomSocket')).singleton(),
        noteTypingSocket: asClass(require('@/services/socket/noteTypingSocket')).singleton(),
        userRoomSocket: asClass(require('@/services/socket/userRoomSocket')).singleton(),
    });
};
