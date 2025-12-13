/**
 * Reaction type enum
 * @readonly
 * @enum {string}
 */
const Reactions = Object.freeze({
    LIKE: 'like',
    LOVE: 'love'
})

/**
 * Type Definition for a valid Reaction.
 * This can be imported in other files to strictly type arguments.
 * @typedef {'like' | 'love'} ReactionType
 */


module.exports = {Reactions};
