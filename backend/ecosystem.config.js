require('dotenv').config();
const fs = require('fs');
const path = require('path');
const config = require('./config/config');
const isDev = config.env === 'development';

const workersDir = path.resolve(__dirname, 'workers');

const workerApps = fs.readdirSync(workersDir)
    .filter(file => file.endsWith('.js'))
    .map(file => {
        const name = path.basename(file, '.js');
        return {
            name: `worker-${name}`,
            script: `./workers/${file}`,
            watch: isDev,
            ignore_watch: ['node_modules', 'logs', 'redis-cluster'],
            env: {
                NODE_ENV: 'development',
                ...process.env
            },
            env_production: {
                NODE_ENV: 'production',
                ...process.env
            },
            autorestart: true,
            max_memory_restart: '300M',
            exp_backoff_restart_delay: 100,
        };
    });

module.exports = {
    apps: [
        {
            name: 'express-api',
            script: './app.js',
            watch: isDev,
            ignore_watch: ['node_modules', 'logs', 'redis-cluster'],
            env: {
                NODE_ENV: 'development',
                ...process.env
            },
            env_production: {
                NODE_ENV: 'production',
                ...process.env
            },
            instances: 1, // max for cpu cores
            autorestart: true,
            max_memory_restart: '500M',
            exp_backoff_restart_delay: 100,
        },
        ...workerApps,
    ],
};
