const config = require('../config/config');
const defaultPrefix = config.env === 'production' ? '{prod:bull}' : '{dev:bull}';

/**
 * BullMQ queue prefix - can be overridden with BULLMQ_PREFIX env var
 * @type {string}
 */
const BULLMQ_PREFIX = process.env.BULLMQ_PREFIX || defaultPrefix;

module.exports = {BULLMQ_PREFIX};
