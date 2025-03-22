/**
 * @typedef {Object} DbPoolSize
 * @property {number} max - Maximum number of connections in the database pool
 * @property {number} min - Minimum number of connections in the database pool
 */

/**
 * @typedef {Object} StoragePaths
 * @property {string} files - Base path for file storage endpoints
 *      @default '/files'
 */

/**
 * @typedef {Object} StorageConfig
 * @property {string} baseUrl - Base URL for storage service
 *      @default process.env.STORAGE_BASE_URL ||
 *        (NODE_ENV === 'production'
 *          ? 'https://storage.yourdomain.com'
 *          : `http://localhost:${AppConfig.port}/api`)
 * @property {string} apiVersion - Storage API version
 *      @default process.env.STORAGE_API_VERSION || 'v1'
 * @property {StoragePaths} paths - Storage endpoint paths configuration
 * @property {function(string|null): string|null} constructFileUrl - Constructs full file URL from file name
 *      @param {string|null} filename - Unique file identifier
 *      @returns {string|null} Fully qualified file URL or null
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
 * @property {Readonly<StorageConfig>} storage - File storage service configuration
 */
