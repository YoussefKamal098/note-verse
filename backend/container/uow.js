const {asClass} = require('awilix');

module.exports = container => {
    container.register({
        uow: asClass(require('../unitOfWork/mongoose.unitOfWork')).singleton()
    });
};
