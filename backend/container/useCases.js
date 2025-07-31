const {asClass} = require('awilix');

module.exports = container => {
    container.register({
        validateUserNoteUpdateUseCase: asClass(require('../useCases/notes/validateUserNoteUpdate.useCase')).transient(),
        validateNoteViewUseCase: asClass(require('../useCases/notes/validateNoteView.useCase')).transient(),
        grantNotePermissionsUseCase: asClass(require('../useCases/notes/grantNotePermissions.useCase')).transient(),
        updateNoteUseCase: asClass(require('../useCases/notes/updateNote.useCase')).transient(),
        createNoteUseCase: asClass(require('../useCases/notes/createNote.useCase')).transient(),
        restoreVersionUseCase: asClass(require('../useCases/versions/restoreVersion.useCase')).transient(),
        validateVersionAccessUseCase: asClass(require('../useCases/versions/validateVersionAccess.useCase')).transient(),
        loginUseCase: asClass(require('../useCases/auth/login.useCase')).transient(),
        googleCallbackUseCase: asClass(require('../useCases/auth/googleCallback.useCase')).transient(),
        verifyEmailUseCase: asClass(require('../useCases/auth/verifyEmail.useCase')).transient(),
    });
};
