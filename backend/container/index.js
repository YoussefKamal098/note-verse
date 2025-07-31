const {createContainer, InjectionMode} = require('awilix');

// Modular registration functions
const registerModels = require('./models');
const registerUow = require('./uow');
const registerRepositories = require('./repositories');
const registerCaches = require('./caches');
const registerBatchers = require('./batchers');
const registerQueues = require('./queues');
const registerHelpers = require('./helpers');
const registerAuth = require('./auth');
const registerStorage = require('./storage');
const registerServices = require('./services');
const registerSocketEvents = require('./socketEvents');
const registerOnline = require('./online');
const registerSocketEventEmitters = require('./socketEventEmitters');
const registerUseCases = require('./useCases');
const registerConsumers = require('./consumers');
const registerConsumerHandlers = require('./consumerHandlers');

const container = createContainer({injectionMode: InjectionMode.PROXY});

registerModels(container);
registerUow(container);
registerRepositories(container);
registerCaches(container);
registerBatchers(container);
registerQueues(container);
registerHelpers(container);
registerAuth(container);
registerStorage(container);
registerServices(container);
registerSocketEvents(container);
registerOnline(container);
registerSocketEventEmitters(container);
registerUseCases(container);
registerConsumers(container);
registerConsumerHandlers(container);

module.exports = container;
