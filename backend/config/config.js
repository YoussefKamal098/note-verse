const {parseString, parseNumber, parseArray} = require('shared-utils/env.utils');
const authConfig = require('./authConfig');
require('dotenv').config();

const config = Object.freeze({
    env: parseString(process.env.NODE_ENV, 'development'),
    port: parseNumber(process.env.PORT, 5000),
    redisUri: parseString(process.env.REDIS_URI, 'redis://localhost:6379'),
    mongoUri: parseString(process.env.MONGO_URI, 'mongodb://localhost:27017/notes'),
    dbPoolSize: Object.freeze({
        max: parseNumber(process.env.DB_MAX_POOL_SIZE, 10),
        min: parseNumber(process.env.DB_MIN_POOL_SIZE, 1),
    }),
    allowedOrigins: parseArray(process.env.ALLOWED_ORIGINS, ['http://localhost:3000']),
    authConfig: authConfig,
});

module.exports = config;
