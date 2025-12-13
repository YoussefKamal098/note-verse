const {asValue} = require('awilix');

module.exports = container => {
    container.register({
        permissionModel: asValue(require('../models/permission.model')),
        noteModel: asValue(require('../models/note.model')),
        userModel: asValue(require('../models/user.model')),
        authProviderModel: asValue(require('../models/authProvider.model')),
        sessionModel: asValue(require('../models/session.model')),
        versionModel: asValue(require('../models/version.model')),
        notificationModel: asValue(require('../models/notification.model')),
        fileModel: asValue(require('../models/file.model')),
        reactionModel: asValue(require('../models/reaction.model'))
    });
};
