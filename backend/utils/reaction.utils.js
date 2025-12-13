const {REACTION_TYPES, DEFAULT_REACTION_COUNTS, REACTION_CONFIG} = require('@/constants/reaction.constants');

/**
 * Utility functions for reaction type management
 */
class ReactionUtils {
    /**
     * Validates if a reaction type is supported
     * @param {string} type
     * @returns {boolean}
     */
    static isValidReactionType(type) {
        return REACTION_TYPES.includes(type);
    }

    /**
     * Gets all valid reaction types
     * @returns {string[]}
     */
    static getValidReactionTypes() {
        return [...REACTION_TYPES];
    }

    /**
     * Sanitizes reaction type (returns default if invalid)
     * @param {string} type
     * @returns {string}
     */
    static sanitizeReactionType(type) {
        return this.isValidReactionType(type) ? type : REACTION_CONFIG.DEFAULT_TYPE;
    }

    /**
     * Creates default reaction counts object
     * @returns {ReactionCounts}
     */
    static createDefaultCounts() {
        return {...DEFAULT_REACTION_COUNTS};
    }

    /**
     * Filters counts to only include valid reaction types
     * @param {Object} counts
     * @returns {ReactionCounts}
     */
    static filterValidCounts(counts) {
        const filtered = {};
        REACTION_TYPES.forEach(type => {
            filtered[type] = counts[type] || 0;
        });
        return filtered;
    }

    /**
     * Gets reaction type priority for sorting
     * @param {string} type
     * @returns {number}
     */
    static getTypePriority(type) {
        return REACTION_CONFIG.PRIORITIES[type] || 999;
    }

    /**
     * Sorts reaction types by priority
     * @param {string[]} types
     * @returns {string[]}
     */
    static sortTypesByPriority(types) {
        return [...types].sort((a, b) =>
            this.getTypePriority(a) - this.getTypePriority(b)
        );
    }
}

module.exports = ReactionUtils;
