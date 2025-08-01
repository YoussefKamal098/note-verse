export const SOCKET_EVENTS = Object.freeze({
    NEW_NOTIFICATION: 'new_notification',
    USER: {
        WATCH: 'user:watch',
        UNWATCH: 'user:unwatch',
        STATUS: 'user_status',
        ONLINE: 'user_online',
        OFFLINE: 'user_offline'
    },
    NOTE: Object.freeze({
        JOIN: 'note_join',
        LEAVE: 'note_leave',
        UPDATE: 'note_update',
    }),
    NOTE_TYPING: Object.freeze({
        START: 'note_typing:start',
        STOP: 'note_typing:stop',
        UPDATE: 'note_typing:update',
        GET: "note_typing:get"
    }),
});
