// ==============================================
// 🛠️ TODO: Refactor Redis Cluster Setup
// ==============================================

/**
 * PLAN:
 * - Convert this standalone Redis.Cluster instance into a connection pool manager
 * - Use `generic-pool` package to efficiently manage Redis cluster connections
 * - Create a class `RedisClusterPool` with:
 *   - `.acquire()` and `.release()` methods
 *   - Automatic reconnection logic
 *   - Optional max/min pool size via env config
 *   - Singleton instance exported from module
 * - Integrate it with existing RedisService or wrap RedisService with pool-aware logic
 *
 * Benefits:
 * - Improved performance under concurrent load
 * - Avoids flooding Redis with excess connections
 * - Ensures safe reuse and cleanup of clients
 *
 * After:
 * - Update all Redis usages to call `await pool.acquire()` and `pool.release()`
 * - Ensure graceful shutdown by draining/destroying the pool
 */

// ==============================================
// Current Redis Cluster (to be replaced)
// ==============================================

require('dotenv').config();
const Redis = require('ioredis');
const {parseBoolean, parseArray} = require('shared-utils/env.utils');
const config = require('@/config/config');

/**
 * WARNING: In production, you should provide multiple cluster nodes
 * Example REDIS_CLUSTER_NODES in .env:
 * REDIS_CLUSTER_NODES=redis://node1:7000,redis://node2:7001,redis://node3:7002
 */
const getClusterNodes = () => {
    const clusterNodes = parseArray(process.env.REDIS_CLUSTER_NODES, ['redis://127.0.0.1:7000']);
    if (clusterNodes.length === 1 && config.env === 'production') {
        console.warn('⚠️  Using single Redis Cluster node in production - recommend 3+ nodes');
    }

    return clusterNodes;
};

// ...
// Redis.Cluster initialization logic remains unchanged until refactor
// ...

const redis = new Redis.Cluster(getClusterNodes(),
    {
        // Redis Connection Options (applied to all nodes)
        redisOptions: {
            password: process.env.REDIS_PASSWORD || undefined, // Auth password
            tls: parseBoolean(process.env.REDIS_TLS) ? {} : undefined, // Enable TLS
            enableReadyCheck: true,  // Wait for cluster to be ready before resolving
            connectTimeout: 30000, // Connection timeout in ms (30s)
            maxRetriesPerRequest: 3, // Max retries for failed commands
            showFriendlyErrorStack: true, // Better error messages (dev only)

            // Custom error reconnection logic
            reconnectOnError: (err) => {
                const targetErrors = ['READONLY', 'ETIMEDOUT', 'ECONNRESET', 'CLUSTERDOWN'];
                return targetErrors.some(target => err.message.includes(target));
            },

            enableAutoPipelining: false, // Disable auto command pipelining
            commandTimeout: 10000, // Max time for command execution (10s)
            keepAlive: 30000, // TCP keepalive in ms (30s)
        },
        // Cluster-Specific Options
        slotsRefreshTimeout: 5000, // Timeout for slots refresh (5s)
        slotsRefreshInterval: 60000, // How often to refresh slots (60s)
        enableReadyCheck: true, // Wait for cluster state to be ready
        enableAutoPipelining: false, // Disable cluster-wide pipelining
        autoPipeliningIgnoredCommands: ['ping'],  // Commands to exclude from pipelining

        // Cluster Retry Strategy
        clusterRetryStrategy: (times) => Math.min(times * 100, 5000),

        // DNS Resolution
        dnsLookup: (address, cb) => cb(null, address, 4),

        // Read Scaling
        scaleReads: 'slave', // Distribute reads to replicas

        // Queue Behavior
        enableOfflineQueue: true, // Queue commands when cluster is down
        retryDelayOnFailover: 2000,  // Delay during failover (2s)
        retryDelayOnClusterDown: 1000,  // Delay when cluster is down (1s)
        retryDelayOnTryAgain: 1000, // Delay for TRYAGAIN errors (1s)

        // Redirection Handling
        maxRedirections: 16, // Max MOVED/ASK redirections to follow
    }
);

// Enhanced event listeners
redis.on('connect', () => console.log('[Redis] Cluster connected ✅'));
redis.on('ready', () => console.log('[Redis] Cluster ready 🟢'));
redis.on('error', err => console.error('[Redis] Cluster error ❌:', err));
redis.on('close', () => console.warn('[Redis] Cluster connection closed'));
redis.on('reconnecting', () => console.log('[Redis] Cluster reconnecting...'));
redis.on('end', () => console.warn('[Redis] Cluster connection ended'));
redis.on('node error', (err, node) => console.error(`[Redis] Node ${node} error:`, err.message));

module.exports = redis;
