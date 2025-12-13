/**
 * Reaction type enum
 * @readonly
 * @enum {string}
 */
const Reactions = Object.freeze({
    LIKE: 'like',
    LOVE: 'love'
});

/**
 * Default reaction types - can be extended via configuration
 * @type {ReactionType[]}
 */
const REACTION_TYPES = Object.freeze(['like', 'love']);

/**
 * Default reaction counts structure
 * @type {ReactionCounts}
 */
const DEFAULT_REACTION_COUNTS = Object.freeze({like: 0, love: 0});

/**
 * Reaction configuration
 */
const REACTION_CONFIG = Object.freeze({
    // Maximum number of reaction types supported
    MAX_TYPES: 10,

    // Default reaction type (used for fallback)
    DEFAULT_TYPE: 'like',

    // Whether to allow multiple reaction per user (future feature)
    ALLOW_MULTIPLE: false,

    // Reaction type priorities for display
    PRIORITIES: {
        like: 1,
        love: 2
    }
});

const REACTION_STREAM_SHARD_COUNT = 2;
const REACTION_STREAM_KEY = (shard) => `stream:reactions:shard:{${shard}}`;

module.exports = {
    REACTION_TYPES,
    DEFAULT_REACTION_COUNTS,
    REACTION_CONFIG,
    REACTION_STREAM_SHARD_COUNT,
    REACTION_STREAM_KEY,
    Reactions
};
