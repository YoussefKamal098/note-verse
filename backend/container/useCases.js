const {asClass} = require('awilix');

module.exports = container => {
    container.register({
        validateNoteUpdateUseCase: asClass(require('../useCases/notes/validateNoteUpdate.useCase')).transient(),
        validateNoteViewUseCase: asClass(require('../useCases/notes/validateNoteView.useCase')).transient(),
        grantNotePermissionsUseCase: asClass(require('../useCases/notes/grantNotePermissions.useCase')).transient()
    });
};
