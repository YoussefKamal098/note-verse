const roles = require('@/enums/roles.enum');
const errorFactory = require('@/errors/factory.error');

/**
 * Stateless service for managing note access control (Authorization)
 * and defining data visibility (Projection) based on user roles.
 * * Thread-safe: Contains no instance state. All methods are static.
 */
class RolesUtils {
    // --- Internal Role Sets for Authorization Checks ---
    static #VALID_ROLES = new Set([roles.OWNER, roles.EDITOR, roles.VIEWER]);
    static #EDIT_ROLES = new Set([roles.OWNER, roles.EDITOR]);
    static #VIEW_ROLES = new Set([roles.OWNER, roles.EDITOR, roles.VIEWER]);

    // --- Utility Methods ---

    /**
     * Internal forbidden error factory
     * @param {string} [message]
     */
    static #forbidden(message) {
        return errorFactory.forbidden(message);
    }

    // --- Role Resolution & Status Methods ---

    /**
     * Checks if user is the Owner.
     * @param {string} role
     * @returns {boolean}
     */
    static isOwner(role) {
        return role === roles.OWNER;
    }

    /**
     * Resolves the user's effective and validated role.
     * @param {string} role
     * @param {Object} [options]
     * @param {boolean} [options.throwOnDenied=true]
     * @returns {string | null} The validated role or null if denied (and not throwing).
     */
    static resolveRole(role, {throwOnDenied = true} = {}) {
        if (role && RolesUtils.#VALID_ROLES.has(role)) {
            return role;
        }

        if (!throwOnDenied) return null;

        // If role is invalid or not provided, access is denied
        throw this.#forbidden();
    }

    // --- Authorization Check Methods ---

    /**
     * Checks if user can edit the note.
     * @param {string} role
     * @param {Object} [options]
     * @param {boolean} [options.throwOnDenied=false]
     * @param {string}  [options.errorMessage]
     * @returns {boolean}
     */
    static canEdit(
        role,
        {throwOnDenied = false, errorMessage} = {}
    ) {
        const allowed = RolesUtils.#EDIT_ROLES.has(role);

        if (!allowed && throwOnDenied) {
            throw this.#forbidden(errorMessage);
        }

        return allowed;
    }

    /**
     * Checks if user can view the note.
     * @param {string} role
     * @param {Object} [options]
     * @param {boolean} [options.throwOnDenied=false]
     * @param {string}  [options.errorMessage]
     * @returns {boolean}
     */
    static canView(
        role,
        {throwOnDenied = false, errorMessage} = {}
    ) {
        const allowed = RolesUtils.#VIEW_ROLES.has(role);

        if (!allowed && throwOnDenied) {
            throw this.#forbidden(errorMessage);
        }

        return allowed;
    }
}

module.exports = RolesUtils;
