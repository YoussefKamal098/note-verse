/**
 * @typedef {'viewer' | 'editor' | 'owner'} UserRoleType
 * Enum for user role types
 * @readonly
 */
const roles = Object.freeze({
    VIEWER: 'viewer',
    EDITOR: 'editor',
    OWNER: 'owner'
});

module.exports = roles;
