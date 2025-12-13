const {REACTION_STREAM_KEY} = require('@/constants/reaction.constants');

/**
 * Redis Streams Consumer for processing reaction events in real-time.
 *
 * Uses Redis Streams with Consumer Groups for reliable, scalable processing of reaction events.
 * Each shard has its own stream and consumer group for horizontal scaling.`
 */


/**
 * Milliseconds in a second - for timeout clarity
 */
const MILLISECONDS_PER_SECOND = 1000;

/**
 * @typedef {Object} ReactionMessage
 * @property {string} id - Stream entry ID
 * @property {string} noteId - ID of the note being reacted to
 * @property {string} userId - ID of the user who reacted
 * @property {ReactionType} [type] - Type of reaction (null for removal)
 * @property {number} ts - Timestamp of the reaction
 * @property {number} [retry] - Number of retry attempts for this message
 */

/**
 * @typedef {Object} ReactionEntry
 * @property {string} id - Stream entry ID
 * @property {ReactionMessage} obj - Parsed reaction message
 */

/**
 * @typedef {Object<string, import('@/repositories/reaction.repository').UserReactionMap>} NotesMap - Map of noteId → user reaction
 */

/**
 * Redis Streams Consumer for processing reaction events in real-time.
 *
 * Uses Redis Streams with Consumer Groups for reliable, scalable processing of reaction events.
 * Each shard has its own stream and consumer group for horizontal scaling.
 */
class ReactionConsumer {
    /** @type {import('ioredis').Cluster} Redis cluster client */
    #redis;

    /** @type {import("@/services/reaction-cache.service").ReactionCache} Cache service for reaction counts */
    #cache;

    /** @type {import("@/repositories/reaction.repository").ReactionRepository} Database repository */
    #repo;

    /** @type {string|number} Shard identifier for horizontal partitioning */
    #shard;

    /** @type {string} Consumer group name (format: group:shard) */
    #group;

    /** @type {string} Consumer name (unique per process) */
    #consumer;

    /** @type {string} Redis stream key for this shard */
    #stream;

    /** @type {string} Dead Letter Queue key for failed messages */
    #dlq;

    /** @type {number} Maximum number of messages to fetch per batch */
    #batchSize;

    /** @type {number} Maximum retry attempts before sending to DLQ */
    #maxRetries;

    /** @type {boolean} Whether the consumer is currently running */
    #running = false;

    /** @type {number} Block timeout in milliseconds when waiting for new messages */
    #blockTimeout = 0.5 * MILLISECONDS_PER_SECOND;

    /** @type {Promise<void>|null} Promise representing the main processing loop */
    #loopPromise = null;

    /**
     * Creates a new ReactionConsumer instance
     *
     * @param {Object} params Configuration parameters
     * @param {import('ioredis').Cluster} params.redis Redis cluster client
     * @param {import("@/services/reaction-cache.service").ReactionCache} params.cache Cache service for reaction counts
     * @param {import("@/repositories/reaction.repository").ReactionRepository} params.repo Database repository
     * @param {string|number} params.shard Shard identifier for horizontal partitioning
     * @param {string} [params.group='rg'] Base consumer group name
     * @param {string} [params.consumer=`c-${process.pid}`] Consumer identifier
     * @param {number} [params.batchSize=1000] Messages to fetch per batch
     * @param {number} [params.maxRetries=3] Max retry attempts before DLQ
     */
    constructor({
                    redis,
                    cache,
                    repo,
                    shard,
                    group = 'rg',
                    consumer = `c-${process.pid}`,
                    batchSize = 1000,
                    maxRetries = 3
                }) {
        this.#redis = redis;
        this.#repo = repo;
        this.#shard = shard;
        this.#cache = cache;
        this.#group = `${group}:${shard}`;
        this.#consumer = consumer;
        this.#stream = REACTION_STREAM_KEY(shard);
        this.#dlq = `${this.#stream}:dlq`;
        this.#batchSize = batchSize;
        this.#maxRetries = maxRetries;
    }

    /**
     * Ensure consumer group exists in Redis stream
     *
     * Creates the consumer group if it doesn't exist. If the group already exists,
     * the BUSYGROUP error is safely ignored.
     *
     * @param {string} [startId='0'] Starting ID for new consumers ('0' = from beginning, '$' = new messages only)
     * @returns {Promise<void>}
     */
    async ensureGroup(startId = '0') {
        try {
            // XGROUP CREATE stream group startId [MKSTREAM]
            // MKSTREAM creates the stream if it doesn't exist
            await this.#redis.xgroup('CREATE', this.#stream, this.#group, startId, 'MKSTREAM');
        } catch (err) {
            // BUSYGROUP means the group already exists - this is expected
            if (!/BUSYGROUP/.test(String(err))) throw err;
        }
    }

    /**
     * Start the consumer to listen for and process reaction messages
     *
     * Creates the consumer group (starting from latest messages) and begins
     * the main processing loop.
     *
     * @returns {Promise<void>}
     */
    async start() {
        // Start from '$' to only process new messages, not historical ones
        await this.ensureGroup('$');
        this.#running = true;
        console.log(`[ReactionConsumer] shard=${this.#shard} started consumer=${this.#consumer}`);
        this.#loopPromise = this.#mainLoop();
    }

    /**
     * Main processing loop - continuously fetches and processes messages
     *
     * Implements the core consumer logic:
     * 1. Blocks waiting for new messages (with timeout)
     * 2. Processes messages in batches
     * 3. Recovers on errors with exponential backoff
     *
     * @returns {Promise<void>}
     * @private
     */
    async #mainLoop() {
        try {
            while (this.#running) {
                // TODO: Implement pending message recovery for fault tolerance
                // await this.#recoverPending();

                /**
                 * XREADGROUP arguments explained:
                 * 'GROUP', groupName, consumerName - Consumer group configuration
                 * 'COUNT', batchSize - Max messages to return per call
                 * 'BLOCK', timeoutMs - Max time to wait for messages (milliseconds)
                 * 'STREAMS', streamKey - Stream to read from
                 * '>' - Special ID meaning "messages never delivered to other consumers"
                 */
                const res = await this.#redis.xreadgroup(
                    'GROUP', this.#group, this.#consumer,
                    'COUNT', this.#batchSize,
                    'BLOCK', this.#blockTimeout,
                    'STREAMS', this.#stream, '>'
                );

                if (!res) {
                    // No messages received within block timeout
                    // Continue loop to wait again
                    continue;
                }

                // res format: [[streamName, [ [id1, fields1], [id2, fields2], ... ]]]
                const entries = res[0][1];
                if (!entries || entries.length === 0) {
                    continue;
                }

                console.log(`[ReactionConsumer] shard=${this.#shard} received batch size=${entries.length}`);
                await this.#processEntries(entries);
            }
        } catch (err) {
            console.error(`[ReactionConsumer] shard=${this.#shard} mainLoop error`, err);
            // Brief delay to avoid tight crash loop (exponential backoff could be added here)
            await new Promise(r => setTimeout(r, 1000));

            // Restart loop if still running
            if (this.#running) {
                return this.#mainLoop();
            }
        }
    }

    /**
     * Parse Redis stream fields array into a structured object
     *
     * Redis streams store data as [field1, value1, field2, value2, ...]
     * This converts it to {field1: value1, field2: value2, ...}
     *
     * @param {string[]} fieldsArray - Array of field-value pairs from Redis stream
     * @returns {ReactionMessage} Parsed reaction message object
     * @private
     */
    #parseFields(fieldsArray) {
        const obj = {};
        for (let i = 0; i < fieldsArray.length; i += 2) {
            obj[fieldsArray[i]] = fieldsArray[i + 1];
        }
        return obj;
    }

    /**
     * Group stream entries by noteId for batch processing
     *
     * Also filters out malformed entries (missing noteId) by acknowledging them
     * to remove them from the Pending Entries List (PEL).
     *
     * @param {Array<[string, string[]]>} entries - Stream entries from Redis
     * @returns {Promise<Map<string, ReactionEntry[]>>} Map of noteId → array of reaction entries
     * @private
     */
    async #groupByNote(entries) {
        const map = new Map();

        /** @type {ReactionEntry[]} */
        const normalizedEntries = entries.map(([id, fields]) => ({
            id,
            obj: this.#parseFields(fields)
        }));

        for (const {id, obj} of normalizedEntries) {
            const noteId = obj.noteId;

            if (!noteId) {
                console.warn(`[ReactionConsumer] shard=${this.#shard} WARN missing noteId id=${id}, ACKing to drop`);
                // ACK malformed messages to remove them from PEL
                await this.#ack([id]);
                continue;
            }

            const arr = map.get(noteId) || [];
            arr.push({id, obj});
            map.set(noteId, arr);
        }

        return map;
    }

    /**
     * Process a batch of stream entries
     *
     * 1. Groups entries by noteId
     * 2. Sorts entries by timestamp (oldest first for consistency)
     * 3. Applies reaction to database
     * 4. Updates cache with new counts
     * 5. Acknowledges successful messages
     *
     * @param {Array<[string, string[]]>} entries - Stream entries to process
     * @returns {Promise<void>}
     * @private
     */
    async #processEntries(entries) {
        const byNote = await this.#groupByNote(entries);

        /** @type {NotesMap} */
        const notesMap = {};

        // Process each note's reaction
        for (const [noteId, msgs] of byNote) {
            // Sort by timestamp to process in chronological order
            msgs.sort((a, b) => Number(a.obj.ts) - Number(b.obj.ts));

            // Build user→reaction map (last reaction for each user wins)
            const users = {};
            for (const {obj} of msgs) {
                users[String(obj.userId)] = obj.type || null;
            }

            notesMap[noteId] = users;
        }

        try {
            // Apply all reaction to database
            const result = await this.#repo.bulkApplyReactionsForManyNotes(notesMap);

            // Update cache with new reaction counts
            await this.#cache.bulkSetCounts(result.noteTotalReactionsCount);

            console.log(`[ReactionConsumer] shard=${this.#shard} batchOK notes=${byNote.size} entries=${entries.length}`);

            // Acknowledge all processed messages
            await this.#ack(entries.map(e => e[0]));
        } catch (err) {
            console.error(`[ReactionConsumer] shard=${this.#shard} ERROR applying batch size=${entries.length} → retry`, err);
            await this.#retryOrDLQ(entries);
        }
    }

    /**
     * Acknowledge processed messages and delete them from the stream
     *
     * Performs two operations:
     * 1. XACK - Removes message from Pending Entries List (PEL)
     * 2. XDEL - Deletes message from stream (optional cleanup)
     *
     * @param {string[]} ids - Stream entry IDs to acknowledge
     * @returns {Promise<void>}
     * @private
     */
    async #ack(ids) {
        if (ids.length === 0) return;

        try {
            await this.#redis.xack(this.#stream, this.#group, ...ids);
            await this.#redis.xdel(this.#stream, ...ids);

            console.log(`[ReactionConsumer] shard=${this.#shard} acked ids=${ids.length}`);
        } catch (err) {
            console.error(`[ReactionConsumer] shard=${this.#shard} ack error`, err);
            // If ACK fails, messages remain in PEL and will be recovered later
        }
    }

    /**
     * Handle failed messages with retry logic or send to Dead Letter Queue
     *
     * For each failed message:
     * 1. Increment retry counter
     * 2. If max retries exceeded → send to DLQ
     * 3. Otherwise → requeue with incremented retry counter
     *
     * @param {Array<[string, string[]] | {id: string, fields?: string[], obj?: Record<string, string>}>} msgs - Failed messages
     * @returns {Promise<void>}
     * @private
     */
    async #retryOrDLQ(msgs) {
        for (const msg of msgs) {
            // Extract fields and parse object from various message formats
            const fields = Array.isArray(msg) ? msg[1] : (msg.fields || msg.obj || []);
            const obj = msg.obj || this.#parseFields(fields || []);

            // Increment retry counter
            const retryCount = parseInt(obj.retry || '0', 10) + 1;

            if (retryCount > this.#maxRetries) {
                // Max retries exceeded - send to Dead Letter Queue
                console.warn(`[ReactionConsumer] shard=${this.#shard} DLQ id=${msg.id} payload=${JSON.stringify(obj)}`);

                await this.#redis.xadd(
                    this.#dlq,
                    '*',
                    ...Object.entries({
                        ...obj,
                        originalId: msg.id,
                        failedAt: Date.now().toString(),
                        retryCount: retryCount.toString(),
                        // movedAt: Date.now().toString(),
                        // shard: String(this.#shard),
                        // consumer: this.#consumer
                    }).flat()
                );

                await this.#ack([msg.id]);
            } else {
                // Retry - requeue with incremented retry counter
                console.log(`[ReactionConsumer] shard=${this.#shard} retry id=${msg.id} retry=${retryCount}`);

                await this.#redis.xadd(
                    this.#stream,
                    '*',
                    ...Object.entries({
                        ...obj,
                        retry: retryCount.toString()
                    }).flat()
                );

                await this.#ack([msg.id]);
            }
        }
    }

    /**
     * Gracefully stop the consumer
     *
     * Sets running flag to false and waits for current processing to complete
     *
     * @returns {Promise<void>}
     */
    async stop() {
        this.#running = false;
        console.log(`[ReactionConsumer] shard=${this.#shard} stopping...`);

        if (this.#loopPromise) {
            await this.#loopPromise;
        }

        console.log(`[ReactionConsumer] shard=${this.#shard} stopped`);
    }
}

module.exports = ReactionConsumer;


/*
TODO: Improvements Required (Future Work)

This system works, but the following improvements are needed to make it safer,
more scalable, and easier to operate at high load.

HIGH PRIORITY – Repository Layer

1. Make repository operations idempotent
   - The same message may be processed more than once
   - Operations must be safe to re-run without double counting
   - Use upserts and last-write-wins behavior where possible

MEDIUM PRIORITY – Redis Stream Consumer

2. Proper handling of pending messages (PEL recovery)
   - Always process pending messages first before reading new ones
   - Use XAUTOCLAIM / XCLAIM for recovery
   - Track retry attempts in a Redis HASH (not by re-adding messages)
   - Do NOT requeue messages using XADD (this breaks ordering)

3. Preserve message ordering
   - Always rely on Redis Stream entry IDs for ordering
   - Never use timestamps for ordering
   - Avoid any logic that can reorder messages during retries

4. Dead Letter Queue (DLQ) handling
   - If processing fails after retries:
     - Move the message to a DLQ with error metadata
     - ACK the original message to prevent reprocessing
   - DLQ processing should not block normal consumption

5. Stream trimming and cleanup
   - Do NOT delete messages after ACK (no XDEL)
   - Stream trimming should be done by the producer or maintenance jobs
   - Use MAXLEN ~ on XADD to prevent unbounded stream growth

LOW PRIORITY – Reliability & Performance

6. Observability and monitoring
   - Track:
     - Batch processing time
     - Retry counts
     - Pending entries (PEL) size
     - Consumer lag
     - DLQ size and growth rate
   - Add alerts for abnormal behavior

7. Backpressure handling
   - Reduce batch size when processing slows down
   - Adjust blocking time dynamically based on load
   - Avoid overwhelming the database under high traffic

8. Validation and safety
    - Validate all stream message fields at the producer
    - Enforce schema validation for reaction messages
    - Reject malformed messages early

9. Testing improvements
    - Add tests for:
      - Partial failures
      - Database outages
      - Consumer crashes and recovery
      - Retry and DLQ behavior

10. Architecture cleanup
    - Consider moving DLQ processing to a separate service
    - Make retry policies configurable
    - Remove MongoDB transactions for single-document updates where possible
    - Optimize for high-throughput scenarios
 */
