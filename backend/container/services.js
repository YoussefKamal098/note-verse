const {asFunction, asClass} = require('awilix');
const B2StorageConfig = require("../config/B2StorageConfig");
const PasswordHasherService = require('../services/passwordHasher.service');
const HasherService = require('../services/hasher.service');
const CacheService = require('../services/cache.service');
const {timeUnit, time} = require('shared-utils/date.utils');
const JwtProviderService = require("../services/jwtProvider.service");

module.exports = container => {
    container.register({
        passwordHasherService: asClass(PasswordHasherService).singleton(),
        hasherService: asClass(HasherService).singleton(),
        cacheService: asClass(CacheService, {
            injector: () => ({
                redisUrl: process.env.REDIS_URL,
                ttl: time({[timeUnit.HOUR]: 1})
            })
        }).singleton(),
        b2StorageEngine: asFunction(() =>
            new (require('../services/storage/b2storage-engine'))(B2StorageConfig)
        ).singleton(),

        userService: asFunction(({passwordHasherService, userRepo, cacheService}) =>
            new (require('../services/user.service'))(passwordHasherService, userRepo, cacheService)
        ).singleton(),

        noteService: asFunction(({noteRepo}) =>
            new (require('../services/note.service'))(noteRepo)
        ).singleton(),

        sessionService: asFunction(({sessionRepo}) =>
            new (require('../services/session.service'))(sessionRepo)
        ).singleton(),

        permissionService: asFunction(({permissionRepo, userRepo, uow}) =>
            new (require('../services/permission.service'))(permissionRepo, userRepo, uow)
        ).singleton(),

        jwtAuthService: asFunction(({userService, sessionService}) =>
            new (require('../services/jwtAuth.service'))(
                userService,
                sessionService,
                new JwtProviderService(),
                require('../config/authConfig')
            )
        ).singleton(),

        googleAuthService: asFunction(({userService, sessionService, jwtAuthService}) =>
            new (require('../services/googleAuth.service'))(
                userService,
                sessionService,
                jwtAuthService,
                require('../config/googleAuthConfig')
            )
        ).singleton(),

        emailMediator: asFunction(({}) =>
            new (require('../services/email.mediator'))(require('../queues/email.queue'))
        ).singleton(),

        fileStorageService: asFunction(({b2StorageEngine, fileRepo}) =>
            new (require('../services/fileStorage.service'))(
                b2StorageEngine,
                fileRepo,
                {filenameGenerator: () => crypto.randomUUID()}
            )
        ).singleton()
    });
};
