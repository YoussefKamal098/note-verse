require('module-alias/register');
const path = require("path");
const {Worker} = require('bullmq');
const {Readable} = require('stream');
const mime = require('mime-types');
const QUEUE_NAMES = require('@/constants/queueNames.constant');
const REDIS = require('@/constants/redis.constants');
const JOB_NAMES = require('@/constants/jobNames.constant');
const {BULLMQ_PREFIX} = require('@/constants/bullmq.constants');
const AvatarGenerationTypes = require('@/enums/avatarGenerationTypes.enum')
const redis = require('@/config/redis');
const container = require('@/container');
const AvatarGeneratorService = require('@/services/avatarGenerator.service');

const pubClient = redis.duplicate();
const avatarGenerator = new AvatarGeneratorService({size: 128});
const fileStorageService = new container.resolve('fileStorageService');

avatarGenerator.registerFontFile(path.join(__dirname, "../fonts/Quicksand/Quicksand-Bold.ttf"), 'bold', 'Quicksand');

/**
 * BullMQ Worker: Avatar Generator
 *
 * This worker listens on the `AVATAR_GENERATION` queue and processes `GENERATE_AVATAR` jobs.
 * For each job, it generates an avatar based on the user's initials, uploads it to the file storage service,
 * and publishes a message to a Redis pub/sub channel.
 *
 * Redis channel format: `avatar_generated:{useType}`
 *
 * Job Data Payload:
 * @typedef {Object} AvatarJobData
 * @property {string} userId - Unique identifier of the user
 * @property {string} firstname - User's first name
 * @property {string} lastname
 * @property {AvatarGenerationType} [useType=AvatarGenerationTypes.PLACEHOLDER]
 */
const worker = new Worker(
    QUEUE_NAMES.AVATAR_GENERATION,
    async job => {
        if (job.name !== JOB_NAMES.GENERATE_AVATAR) return;

        const {userId, firstname, lastname, useType = AvatarGenerationTypes.PLACEHOLDER} = job.data || {};
        if (!userId || !firstname || !lastname) return;

        try {
            // 1. Generate PNG buffer
            const pngBuffer = avatarGenerator.generate({
                firstname,
                lastname,
                id: userId
            });

            // 2. Convert buffer to readable stream
            const stream = Readable.from(pngBuffer);

            // 3. Upload using FileStorageService
            const uploadedFile = await fileStorageService.upload(stream, {
                mimetype: mime.lookup('png') || 'image/png',
                userId
            });

            const payload = {
                fileId: uploadedFile.id,
                userId,
                useType,
                size: uploadedFile.size,
                mimetype: uploadedFile.mimetype,
                createdAt: Date.now()
            };

            // 4. Publish to Redis channel
            const channel = REDIS.CHANNELS.AVATAR_GENERATED(useType);
            await pubClient.publish(channel, JSON.stringify(payload));

            console.log(`[AVATAR.WORKER] [PUB] Published avatar to ${channel}`, payload);

            return uploadedFile;
        } catch (error) {
            console.error('[AVATAR.WORKER] Failed to generate/upload avatar:', error);
            throw error;
        }
    },
    {
        prefix: BULLMQ_PREFIX,
        connection: redis.options,
        concurrency: 10,
        autorun: true,
        lockDuration: 60000,
        useWorkerThreads: true,

        // Job cleanup
        removeOnComplete: {
            age: 3600,
            count: 1000
        },
        removeOnFail: {
            age: 86400,
            count: 100
        },

        // Rate limit and retries
        limiter: {
            max: 500,
            duration: 5000
        },
        settings: {
            backoffStrategy: (attemptsMade) => Math.min(attemptsMade * 2000, 60000)
        },
        runRetryDelay: 5000,

        // Metrics
        metrics: {
            maxDataPoints: 100
        }
    }
);

// Event listeners
worker.on('completed', job => {
    const duration = Date.now() - job.timestamp;
    console.log(`[AVATAR.WORKER] [✓] Job ${job.id} completed in ${duration}ms after ${job.attemptsMade} attempt(s)`);
});

worker.on('failed', (job, err) => {
    const failCount = job.attemptsMade;
    console.error(`[AVATAR.WORKER] [✗] Job ${job?.id} failed ${failCount} time(s):`, err);
    if (failCount >= 3) {
        // Trigger alerts (email/Slack/etc)
        console.error(`[AVATAR.WORKER] [ALERT] Job ${job.id} failed repeatedly`);
    }
});

worker.on('error', err => {
    console.error('[AVATAR.WORKER] Worker internal error:', err);
});

worker.on('closing', () => {
    console.info('[AVATAR.WORKER] Worker is shutting down...');
});

pubClient.on('connect', () => console.info('[AVATAR.WORKER][REDIS] Pub client connected'));
pubClient.on('ready', () => console.info('[AVATAR.WORKER][REDIS] Pub client ready'));
pubClient.on('error', err => console.error('[AVATAR.WORKER][REDIS] Pub client error:', err));
pubClient.on('end', () => console.info('[AVATAR.WORKER][REDIS] Pub client disconnected'));

// Graceful shutdown
const shutdown = async () => {
    console.log(`[AVATAR.WORKER] ${worker.name} is shutting down...`);
    pubClient.status === 'ready' && await pubClient.quit();
    await worker.close();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGQUIT', shutdown);
