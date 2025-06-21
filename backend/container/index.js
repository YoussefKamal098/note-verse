const {createContainer, InjectionMode} = require('awilix');

// Modular registration functions
const registerModels = require('./models');
const registerUow = require('./uow');
const registerRepositories = require('./repositories');
const registerServices = require('./services');
const registerUseCases = require('./useCases');

const container = createContainer({
    injectionMode: InjectionMode.PROXY
});

registerModels(container);
registerUow(container);
registerRepositories(container);
registerServices(container);
registerUseCases(container);

module.exports = container;
