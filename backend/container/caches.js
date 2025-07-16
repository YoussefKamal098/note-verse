const {asFunction, asClass} = require('awilix');
const B2StorageConfig = require("../config/B2StorageConfig");
const PasswordHasherService = require('../services/passwordHasher.service');
const HasherService = require('../services/hasher.service');
const CacheService = require('../services/cache.service');
const {timeUnit, time} = require('shared-utils/date.utils');
const JwtProviderService = require("../services/jwtProvider.service");
const redis = require('../config/redis');

module.exports = container => {
    container.register({
        notificationCache: asFunction(({redisService}) =>
            new (require('../services/caches/notification.cache'))(redisService)
        ).singleton()
    });
};
