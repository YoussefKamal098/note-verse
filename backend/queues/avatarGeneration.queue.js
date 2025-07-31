const {Queue} = require('bullmq');
const QUEUE_NAMES = require('@/constants/queueNames.constant');
const JOB_NAMES = require('@/constants/jobNames.constant');
const {BULLMQ_PREFIX} = require('@/constants/bullmq.constants');
const AvatarGenerationTypes = require('@/enums/avatarGenerationTypes.enum')

/**
 * A queue service for managing avatar generation jobs in BullMQ.
 *
 * @class AvatarGenerationQueue
 */
class AvatarGenerationQueue {
    /**
     * @private
     * @type {Queue}
     */
    #queue;

    /**
     * Creates a new AvatarQueue instance
     * @param {Object} dependencies
     * @param {import('ioredis').Cluster} dependencies.redisClient - Redis client instance
     */
    constructor({redisClient}) {
        this.#queue = new Queue(QUEUE_NAMES.AVATAR_GENERATION, {
            connection: redisClient.options,
            prefix: BULLMQ_PREFIX,
            defaultJobOptions: {
                removeOnComplete: 1000,
                removeOnFail: 100,
                // delay: 5000, // delay execution 5s
                // ttl: 60000,  // discard if not processed in 60s
                backoff: {type: 'exponential', delay: 2000},
                attempts: 3
            }
        });

        // Queue-level logging
        this.#queue.on('waiting', ({id}) => {
            console.debug(`[AvatarQueue] Job ${id} is waiting`, {queue: QUEUE_NAMES.AVATAR_GENERATION});
        });

        this.#queue.on('error', (err) => {
            console.error('[AvatarQueue] Queue error occurred', {
                error: err,
                queue: QUEUE_NAMES.AVATAR_GENERATION
            });
        });
    }

    /**
     * Returns the name of the avatar generation queue.
     *
     * @returns {string} The queue name.
     */
    get queueName() {
        return QUEUE_NAMES.AVATAR_GENERATION;
    }

    /**
     * Adds an avatar generation job to the queue.
     * @param {Object} payload
     * @param {string} payload.userId - User ID to identify and hash color
     * @param {string} payload.firstname - User's first name (for initials)
     * @param {string} payload.lastname - User's last name (for initials)
     * @param {AvatarGenerationType} [payload.useType=AvatarGenerationTypes.PLACEHOLDER] - Avatar use case
     * @returns {Promise<Object>} Job object added to the queue
     */
    async addAvatarJob(payload = {}) {
        const {userId, useType = AvatarGenerationTypes.PLACEHOLDER} = payload;
        if (!userId) {
            throw new Error('[AvatarQueue] userId is required in payload');
        }

        try {
            const job = await this.#queue.add(JOB_NAMES.GENERATE_AVATAR, payload);

            console.info('[AvatarQueue] Avatar job added', {
                jobId: job.id,
                userId: payload.userId,
                useType,
                queue: QUEUE_NAMES.AVATAR_GENERATION
            });

            return job;
        } catch (err) {
            console.error('[AvatarQueue] Failed to enqueue avatar job', {
                error: err.message,
                payload,
                stack: err.stack
            });
            throw err;
        }
    }

    /**
     * Retrieves the current status counts of the queue,
     * such as active, waiting, delayed, completed, and failed jobs.
     *
     * @returns {Promise<{name: string, counts: import('bullmq').JobCounts}>} The queue name and job counts.
     */
    async getStatus() {
        const counts = await this.#queue.getJobCounts();
        return {
            name: QUEUE_NAMES.AVATAR_GENERATION,
            counts
        };
    }

    /**
     * Gracefully closes the underlying BullMQ queue connection.
     *
     * @returns {Promise<void>}
     */
    async close() {
        await this.#queue.close();
    }
}

module.exports = AvatarGenerationQueue;
