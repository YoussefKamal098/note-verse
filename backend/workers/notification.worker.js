require('module-alias/register');
const {Worker} = require('bullmq');
const QUEUE_NAMES = require('@/constants/queueNames.constant');
const JOB_NAMES = require('@/constants/jobNames.constant');
const {BULLMQ_PREFIX} = require("@/constants/bullmq.constants");
const container = require('@/container');
const redis = require('@/config/redis');

// Resolve notification service from DI container
const notificationService = container.resolve('notificationService');

/**
 * Creates a BullMQ worker to process notifications
 *
 * This worker:
 * - Handles both single notifications and batch processing
 * - Implements proper error handling and retry logic
 * - Includes metrics and rate limiting
 * - Supports graceful shutdown
 */
const worker = new Worker(
    QUEUE_NAMES.NOTIFICATIONS,
    async job => {
        if (job.name !== JOB_NAMES.PROCESS_NOTIFICATION) return;

        const payload = job.data;
        if (!payload) return;

        try {
            // If array => use batchCreate
            if (Array.isArray(payload)) {
                if (payload.length === 0) return;
                await notificationService.batchCreate(payload);
            } else {
                // Single notification object
                await notificationService.create(payload);
            }
        } catch (err) {
            console.error(`[NOTIFICATION.WORKER] Job ${job.id} failed:`, err);
            throw err; // Let BullMQ handle retries
        }
    },
    {
        // Configuration options:
        prefix: BULLMQ_PREFIX, // Redis key prefix for isolation
        connection: redis.options, // Redis connection config
        concurrency: 20, // Optimal for I/O bound tasks
        autorun: true, // Start processing immediately
        lockDuration: 60000, // Job lock duration (1 min)

        // Automatic cleanup:
        removeOnComplete: {
            age: 3600, // Keep successful jobs for 1 hour
            count: 1000 // Or max 1000 jobs
        },
        removeOnFail: {
            age: 86400, // Keep failed jobs for 1 day
            count: 100 // Or max 100 jobs
        },

        // Performance optimizations:
        useWorkerThreads: true, // Offload to worker threads
        limiter: {
            max: 800, // Max 800 jobs
            duration: 5000 // Per 5 seconds (160/sec rate limit)
        },
        metrics: {
            maxDataPoints: 100 // Store metrics for monitoring
        },

        // Retry strategy:
        settings: {
            backoffStrategy: (attemptsMade) => Math.min(attemptsMade * 2000, 60000) // Exponential backoff capped at 1 min
        },
        runRetryDelay: 5000 // Delay between retries
    }
);

worker.on('completed', job => {
    const duration = Date.now() - job.timestamp;
    console.log(`[NOTIFICATION.WORKER] [✓] Job ${job.id} processed in ${duration}ms with ${job.attemptsMade} attempts`);
});

worker.on('failed', (job, err) => {
    const failCount = job.attemptsMade;
    if (failCount >= 3) {
        // Send email/Slack alert here
        console.error(`[NOTIFICATION.WORKER] [ALERT] Job ${job.id} failed ${failCount} times, ${err}`);
    }
});

worker.on('error', err => {
    console.error('[NOTIFICATION.WORKER] Worker Error', err);
});

worker.on('closing', () => {
    console.info('[NOTIFICATION.WORKER] Worker is closing...');
});


// Graceful shutdown
const shutdown = async () => {
    console.log(`[NOTIFICATION.WORKER]  ${worker.name} Shutting down...`);
    await worker.close();
    process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGQUIT', shutdown);
