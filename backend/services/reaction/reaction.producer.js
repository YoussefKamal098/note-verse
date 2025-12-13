const crypto = require('crypto');
const {REACTION_STREAM_KEY, REACTION_STREAM_SHARD_COUNT} = require('@/constants/reaction.constants');

/**
 * @typedef {Object} ProduceParams
 * @property {string} noteId
 * @property {string} userId
 * @property {ReactionType|null} type
 */

class ReactionProducer {
    /** @type {import('ioredis').Cluster} */ #redis;
    /** @type {number} */ #shardCount;

    /**
     * @param {Object} params
     * @param {import('ioredis').Cluster} params.redis
     */
    constructor({redis}) {
        this.#redis = redis;
        this.#shardCount = REACTION_STREAM_SHARD_COUNT;
    }

    /**
     * @param {string|number} noteId
     */
    _shardFor(noteId) {
        const hash = crypto.createHash('sha1').update(String(noteId)).digest('hex');
        return parseInt(hash.slice(0, 8), 16) % (this.#shardCount);
    }

    /**
     * @param {number|string} shard
     */
    streamForShard(shard) {
        return REACTION_STREAM_KEY(shard);
    }

    /**
     * @param {ProduceParams} params
     */
    async produce({noteId, userId, type}) {
        const shard = this._shardFor(noteId);
        const stream = this.streamForShard(shard);

        return this.#redis.xadd(
            stream,
            '*',
            'noteId', String(noteId),
            'userId', String(userId),
            'type', String(type || ''),
            'ts', Date.now().toString()
        );
    }
}

module.exports = ReactionProducer;
