const {asFunction} = require('awilix');

module.exports = container => {
    container.register({
        permissionRepo: asFunction(({permissionModel}) =>
            new (require('../repositories/permission.repository'))(permissionModel)
        ).singleton(),

        noteRepo: asFunction(({noteModel}) =>
            new (require('../repositories/note.repository'))(noteModel)
        ).singleton(),
        userRepo: asFunction(({userModel, authProviderModel}) =>
            new (require('../repositories/user.repository'))(userModel, authProviderModel)
        ).singleton(),
        sessionRepo: asFunction(({sessionModel}) =>
            new (require('../repositories/session.repository'))(sessionModel)
        ).singleton(),
        versionRepo: asFunction(({versionModel}) =>
            new (require('../repositories/version.repository'))(versionModel)
        ).singleton(),
        notificationRepo: asFunction(({notificationModel}) =>
            new (require('../repositories/notification.repository'))(notificationModel)
        ).singleton(),

        fileRepo: asFunction(({fileModel}) =>
            new (require('../repositories/file.repository'))(fileModel)
        ).singleton(),
    });
};
