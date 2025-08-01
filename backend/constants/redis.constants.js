const AvatarGenerationTypes = require('@/enums/avatarGenerationTypes.enum')

/** @readonly */
module.exports = Object.freeze({
    CHANNELS: Object.freeze({
        SOCKET_EVENTS: 'socket:events',
        NOTIFICATIONS: 'socket:notifications',
        AVATAR_GENERATED: (useType = AvatarGenerationTypes.PLACEHOLDER) => `avatar.generated.${useType}`
    }),
    EVENT_TYPES: Object.freeze({
        NOTIFICATION: 'event:notification',
        NOTE: 'event:note',
        USER: 'event:user'
    })
});
