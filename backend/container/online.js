const {asClass} = require('awilix');

module.exports = container => {
    container.register({
        onlineUserService: asClass(require('@/services/online/user.online')).singleton(),
        onlineNoteService: asClass(require('@/services/online/note.online')).singleton(),
        onlineNoteTypingService: asClass(require('@/services/online/noteTyping.online')).singleton(),
    });
};
