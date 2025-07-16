const {Mutex} = require('async-mutex');

/**
 * A batcher for queuing notifications and sending them in optimized batches
 * @class NotificationBatcher
 */
class NotificationBatcher {
    /**
     * BullMQ queue instance for sending notifications
     * @private
     * @type {NotificationQueue}
     */
    #queue;

    /**
     * Current batch of notifications awaiting processing
     * @private
     * @type {Array<NotificationInput>}
     */
    #batch;

    /**
     * Maximum number of notifications per batch
     * @private
     * @type {number}
     */
    #batchSize;

    /**
     * Maximum time (ms) to wait before flushing an incomplete batch
     * @private
     * @type {number}
     */
    #timeout

    /**
     * Timer reference for automatic flushing
     * @private
     * @type {ReturnType<NodeJS.Timeout>|null}
     */
    #timer;


    /**
     * Mutex to ensure thread-safe access to the batch
     * Prevents concurrent modifications from overlapping flush/add calls
     * @private
     * @type {import('async-mutex').Mutex}
     */
    #mutex;


    /**
     * Creates a NotificationBatcher instance
     * @param {Object} params
     * @param {NotificationQueue} params.notificationQueue - Queue instance for sending notifications
     * @param {number} [params.batchSize=100] - Maximum notifications per batch
     * @param {number} [params.timeout=500] - Maximum wait time (ms) before flushing
     */
    constructor({notificationQueue, batchSize = 100, timeout = 500}) {
        this.#queue = notificationQueue;
        this.#batchSize = batchSize;
        this.#timeout = timeout;

        this.#batch = [];
        this.#timer = null;

        this.#mutex = new Mutex();
    }

    /**
     * Gets the current pending batch size
     * @returns {number}
     */
    get pendingCount() {
        return this.#batch.length;
    }

    /**
     * Adds a notification to the current batch
     * @param {NotificationInput} item - Notification to add
     * @returns {Promise<void>}
     * @throws {Error} If batch processing fails
     */
    async add(item) {
        let shouldFlush = false;
        let sizeExceeded = false;

        await this.#mutex.runExclusive(async () => {
            this.#batch.push(item);

            const estimatedSize = JSON.stringify(this.#batch).length;
            if (estimatedSize > 5 * 1024 * 1024) {
                console.warn("[NotificationBatcher] ⚠️ Batch size exceeded 5MB, flushing early");
                sizeExceeded = true;
                return;
            }

            if (this.#batch.length >= this.#batchSize) {
                shouldFlush = true;
            } else if (!this.#timer) {
                this.#timer = setTimeout(() => this.flush(), this.#timeout);
            }
        });

        if (sizeExceeded || shouldFlush) {
            await this.flush();
        }
    }

    /**
     * Immediately sends the current batch to the queue
     * @returns {Promise<Array<NotificationInput>>}
     * @throws {Error} If queue submission fails
     */
    async flush() {
        return this.#mutex.runExclusive(async () => {
            if (this.#timer) {
                clearTimeout(this.#timer);
                this.#timer = null;
            }

            if (this.#batch.length <= 0) return [];

            const batchToSend = [...this.#batch];
            this.#batch = [];

            try {
                await this.#queue.addNotificationJob(batchToSend);
            } catch (error) {
                console.error('[NotificationBatcher] Batch submission failed:', error);
                throw error;
            }

            return batchToSend;
        });
    }

    /**
     * Clean up resources
     * @returns {void}
     */
    dispose() {
        if (this.#timer) {
            clearTimeout(this.#timer);
        }
        this.#batch = [];
    }
}

module.exports = NotificationBatcher;
