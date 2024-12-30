require('dotenv').config();

const config = Object.freeze({
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    redisUri: process.env.REDIS_URI || 'redis://localhost:6379',
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/notes',
    dbPoolSize: Object.freeze({
        max: parseInt(process.env.DB_MAX_POOL_SIZE, 10) || 10,
        min: parseInt(process.env.DB_MIN_POOL_SIZE, 10) || 1
    }),
    allowedOrigins: process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',') : [`http://localhost:3000`],
    authConfig: Object.freeze({
        accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'your-access-token-secret',
        accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '1h',
        refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'your-refresh-token-secret',
        refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '1d',
        cookiesName: process.env.REFRESH_TOKEN_COOKIES_NAME || 'jwt',
        cookiesMaxAge: Number(process.env.COOKIES_MAX_AGE) || 24 * 60 * 60 /* 24 hours in seconds */,
    })
});

module.exports = config;
