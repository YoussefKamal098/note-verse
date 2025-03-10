/**
 * @typedef {Object} DbPoolSize
 * @property {number} max - Maximum number of connections in the database pool
 * @property {number} min - Minimum number of connections in the database pool
 */

/**
 * @typedef {Readonly<Object>} AppConfig Application configuration object
 * @readonly
 * @property {string} env - Current environment (development/production/staging)
 *      @default process.env.NODE_ENV || 'development'
 * @property {number} port - Port number for the HTTP server
 *      @default process.env.PORT || 5000
 * @property {string} logsDir - Directory path for storing log files
 *      @default process.env.LOGS_DIR || '/var/app_logs'
 * @property {string} redisUri - Redis connection URI
 *      @default process.env.REDIS_URI || 'redis://localhost:6379'
 * @property {string} mongoUri - MongoDB connection URI
 *      @default process.env.MONGO_URI || 'mongodb://localhost:27017/notes'
 * @property {DbPoolSize} dbPoolSize - Database connection pool size configuration
 * @property {readonly string[]} allowedOrigins - CORS allowed origins
 *      @default process.env.ALLOWED_ORIGINS || ['http://localhost:3000']
 */
