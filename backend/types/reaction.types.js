/**
 * @typedef {'like' | 'love'} ReactionType
 */

/**
 * Reaction counts object with all possible reaction types
 * @typedef {Object} ReactionCounts
 * @property {number} like
 * @property {number} love
 */

/**
 * Reaction data for creating/updating reaction
 * @typedef {Object} ReactionData
 * @property {string} noteId
 * @property {string} userId
 * @property {ReactionType} type
 */

/**
 * User reaction information
 * @typedef {Object} UserReaction
 * @property {string} id
 * @property {string} noteId
 * @property {string} userId
 * @property {ReactionType} type
 * @property {Date} createdAt
 * @property {Date} updatedAt
 */


