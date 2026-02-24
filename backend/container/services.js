const {asFunction, asClass} = require('awilix');
const PasswordHasherService = require('@/services/passwordHasher.service');
const HasherService = require('@/services/hasher.service');
const CacheService = require('@/services/cache.service');
const config = require('@/config/config');
const redis = require('@/config/redis');

module.exports = container => {
    container.register({
        passwordHasherService: asClass(PasswordHasherService).singleton(),
        hasherService: asClass(HasherService).singleton(),

        cacheService: asFunction(() =>
            new CacheService({redisUrl: config.redisUri})
        ).singleton(),

        redisService: asFunction(() =>
            new (require('@/services/redis.service'))({redisClient: redis})
        ).singleton(),

        notificationService: asClass(require('@/services/notification')).singleton(),

        userService: asFunction(({passwordHasherService, userRepo, cacheService}) =>
            new (require('@/services/user.service'))(passwordHasherService, userRepo, cacheService)
        ).singleton(),

        noteSearchService: asClass(require('@/services/noteSearch.service')).singleton(),
        noteService: asClass(require('@/services/note.service')).singleton(),

        sessionService: asFunction(({sessionRepo}) =>
            new (require('@/services/session.service'))(sessionRepo)
        ).singleton(),

        permissionService: asClass(require('@/services/permission.service')).singleton(),
        versionService: asClass(require('@/services/version.service')).singleton(),

        fileStorageService: asFunction(({b2StorageEngine, fileRepo}) =>
            new (require('@/services/fileStorage.service'))(
                b2StorageEngine,
                fileRepo,
                {filenameGenerator: () => crypto.randomUUID()}
            )
        ).singleton(),

        emailMediator: asFunction(({}) =>
            new (require('@/services/email.mediator'))(require('@/queues/email.queue'))
        ).singleton(),

        reactionService: asFunction(({reactionCache, reactionRepo}) =>
            new (require('@/services/reaction'))({
                reactionProducer: new (require('@/services/reaction/reaction.producer'))({redis: redis}),
                reactionCache,
                reactionRepo
            })
        ).singleton(),
    });
};
