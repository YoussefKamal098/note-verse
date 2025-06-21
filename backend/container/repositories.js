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

        fileRepo: asFunction(({fileModel}) =>
            new (require('../repositories/file.repository'))(fileModel)
        ).singleton(),
    });
};
