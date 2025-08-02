const {parseString, parseNumber, parseArray} = require('shared-utils/env.utils');
const {deepFreeze} = require("shared-utils/obj.utils");
require('dotenv').config();

const appConfig = {
    env: parseString(process.env.NODE_ENV, 'development'),
    socketPort: parseNumber(process.env.SOCKET_PORT, 4000),
    port: parseNumber(process.env.PORT, 5000),
    logsDir: parseString(process.env.LOGS_DIR, '/var/app_logs'),
    redisUri: parseString(process.env.REDIS_URI, 'redis://localhost:6379'),
    mongoUri: parseString(process.env.MONGO_URI, 'mongodb://localhost:27017/notes'),
    dbPoolSize: {
        max: parseNumber(process.env.DB_MAX_POOL_SIZE, 10),
        min: parseNumber(process.env.DB_MIN_POOL_SIZE, 1),
    },
    allowedOrigins: parseArray(process.env.ALLOWED_ORIGINS, ['http://localhost:3000']),  // Frontend baseUrl
    storage: {
        baseUrl: parseString(
            process.env.STORAGE_BASE_URL,
            process.env.NODE_ENV === 'production'
                ? 'https://storage.yourdomain.com'
                : `http://localhost:${process.env.PORT || 5000}/api`
        ),
        apiVersion: parseString(process.env.STORAGE_API_VERSION, 'v1'),
        paths: {
            files: '/files'
        },
        constructFileUrl: (filename) => {
            if (!filename) return null;
            return `${appConfig.storage.baseUrl}/${appConfig.storage.apiVersion}/${appConfig.storage.paths.files}/${filename}`;
        }
    }
};

/**
 * @type {AppConfig}
 */
module.exports = deepFreeze(appConfig);
