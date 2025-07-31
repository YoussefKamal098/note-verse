const {Queue} = require('bullmq');
const QUEUE_NAMES = require('@/constants/queueNames.constant');
const JOB_NAMES = require('@/constants/jobNames.constant');
const {BULLMQ_PREFIX} = require("@/constants/bullmq.constants");
const NotificationType = require('@/enums/notifications.enum');

/**
 * A queue service for managing notification jobs in BullMQ.
 * Handles both single notifications and batches with priority-based processing.
 *
 * @class NotificationQueue
 */
class NotificationQueue {
    /**
     * BullMQ queue instance
     * @private
     * @type {Queue}
     */
    #queue;

    /**
     * Creates a new NotificationQueue instance
     * @param {Object} dependencies
     * @param {import('ioredis').Cluster} dependencies.redisClient - Redis client configuration
     */
    constructor({redisClient}) {
        /**
         * Queue Configuration Options:
         * - connection: Redis client configuration
         * - prefix: Namespace prefix for Redis keys
         * - defaultJobOptions: Default settings for all jobs in this queue
         *   - removeOnComplete: Keep up to 1000 completed jobs
         *   - removeOnFail: Keep up to 100 failed jobs
         *   - backoff: Exponential backoff for retries (2s, 4s, 8s...)
         *   - attempts: Maximum 3 retry attempts per job
         */
        this.#queue = new Queue(QUEUE_NAMES.NOTIFICATIONS, {
            connection: redisClient.options,
            prefix: BULLMQ_PREFIX,
            defaultJobOptions: {
                removeOnComplete: 1000,
                removeOnFail: 100,
                backoff: {type: 'exponential', delay: 2000},
                attempts: 3
            }
        });

        // Add event listeners for queue-level logging
        this.#queue.on('waiting', (id) => {
            console.debug(`[NotificationQueue] Job ${id} is waiting`, {queue: QUEUE_NAMES.NOTIFICATIONS});
        });

        this.#queue.on('error', (err) => {
            console.error('[NotificationQueue] Queue error occurred', {error: err, queue: QUEUE_NAMES.NOTIFICATIONS});
        });
    }

    /**
     * Adds notification job(s) to the queue with priority handling
     * @param {Array<NotificationInput> | NotificationInput} notificationData - Single notification or array of notifications
     * @returns {Promise<Object|Array<Object>>} Added job(s) (same format as input)
     * @throws {Error} If job creation fails
     */
    async addNotificationJob(notificationData) {
        // Handle both single notification and array cases
        const isBatch = Array.isArray(notificationData);
        const notifications = isBatch ? notificationData : [notificationData];

        try {
            const jobs = await Promise.all(
                notifications.map(notification => {
                    const priority = this.#getPriority(notification.type);
                    return this.#queue.add(
                        JOB_NAMES.PROCESS_NOTIFICATION,
                        notification,
                        {priority}
                    );
                })
            );

            // Log results
            jobs.forEach(job => {
                console.info('[NotificationQueue] Successfully added notification job', {
                    jobId: job.id,
                    type: job.data.type,
                    recipient: job.data.recipient,
                    priority: job.opts.priority,
                    queue: QUEUE_NAMES.NOTIFICATIONS
                });
            });

            return isBatch ? jobs : jobs[0]; // Return same format as input
        } catch (error) {
            console.error('[NotificationQueue] Failed to add notification job(s)', {
                error: error.message,
                isBatch,
                count: isBatch ? notifications.length : 1,
                stack: error.stack
            });
            throw error;
        }
    }

    /**
     * Determines job priority based on notification type
     * @private
     * @param {NotificationType} type - Notification type from NotificationType enum
     * @returns {number} Priority value (lower numbers = higher priority)
     */
    #getPriority(type) {
        const priorities = {
            [NotificationType.LOGIN]: 3,
            [NotificationType.NOTE_UPDATE]: 2
        };

        return priorities[type] || 5;
    }
}

module.exports = NotificationQueue;
