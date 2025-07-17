/**
 * @class ClusterHealthMonitor
 * @description Monitors Redis cluster health and manages degraded mode
 */
class ClusterHealthMonitor {
    /**
     * @private
     * @type {import('ioredis').Redis}
     */
    #redisClient;

    /**
     * @private
     * @type {boolean}
     */
    #isDegraded = false;

    /**
     * @private
     * @type {ReturnType<NodeJS.Timeout>|null}
     */
    #healthCheckInterval = null;

    /**
     * @constructor
     * @param {import('ioredis').Redis} redisClient - Redis client
     */
    constructor(redisClient) {
        this.#redisClient = redisClient;
    }

    /**
     * Gets degraded mode status
     * @returns {boolean}
     */
    get isDegraded() {
        return this.#isDegraded;
    }

    /**
     * Checks cluster health status
     * @returns {Promise<{status: string, nodes?: number, error?: string}>}
     */
    async checkHealth() {
        try {
            await this.#redisClient.ping();
            const info = await this.#redisClient.cluster('INFO');
            return {
                status: info.includes('cluster_state:ok') ? 'healthy' : 'degraded',
                nodes: (await this.#redisClient.cluster('NODES')).split('\n').length
            };
        } catch (err) {
            return {status: 'unhealthy', error: err.message};
        }
    }

    /**
     * Starts periodic health checks
     * @param {Function} checkCallback - Callback for health results
     * @param {number} [interval=5000] - Check interval in ms
     */
    startPeriodicCheck(checkCallback, interval = 5000) {
        this.#healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.checkHealth();
                checkCallback(health);
            } catch (err) {
                console.error('[HealthMonitor] Check failed:', err.message);
            }
        }, interval);
    }

    /**
     * Stops periodic health checks
     */
    stopPeriodicCheck() {
        if (this.#healthCheckInterval) {
            clearInterval(this.#healthCheckInterval);
            this.#healthCheckInterval = null;
        }
    }

    /**
     * Enters degraded mode
     */
    enterDegradedMode() {
        if (this.#isDegraded) return;
        this.#isDegraded = true;
        console.warn('[HealthMonitor] Entered degraded mode');
    }

    /**
     * Exits degraded mode
     */
    exitDegradedMode() {
        if (!this.#isDegraded) return;
        this.#isDegraded = false;
        console.warn('[HealthMonitor] Exited degraded mode');
    }
}

module.exports = ClusterHealthMonitor;
