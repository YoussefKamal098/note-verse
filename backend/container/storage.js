const {asFunction} = require('awilix');
const B2StorageConfig = require("../config/B2StorageConfig");

module.exports = container => {
    container.register({
        b2StorageEngine: asFunction(() =>
            new (require('../services/storage/b2storage-engine'))(B2StorageConfig)
        ).singleton(),
    });
};
