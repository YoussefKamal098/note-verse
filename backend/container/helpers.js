const {asClass} = require('awilix');

module.exports = container => {
    container.register({
        transactionService: asClass(require('../services/helpers/baseTransaction.service')).singleton(),
        resourceUserCombiner: asClass(require('../services/helpers/userResourceCombiner.service')).singleton(),
        resourceNoteCombiner: asClass(require('../services/helpers/noteResourceCombiner.service')).singleton(),
        resourceVersionCombiner: asClass(require('../services/helpers/versionUserCombiner.service')).singleton(),
        resourceSessionCombiner: asClass(require('../services/helpers/sessionResourceCombiner.service')).singleton()
    });
};
