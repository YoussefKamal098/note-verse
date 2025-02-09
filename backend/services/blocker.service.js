const {time, timeUnit, compareDates, timeFromNow} = require("shared-utils/date.utils");

class BlockerService {
    #cacheService;
    #blockTime;

    constructor(cacheService, blockTime = time({[timeUnit.MINUTE]: 15}, timeUnit.SECOND)) {
        this.#cacheService = cacheService;
        this.#blockTime = blockTime;
    }

    #generateBlockKey(key) {
        return `${key}:blockTime:${(time({[timeUnit.SECOND]: this.#blockTime}, timeUnit.MINUTE)).toFixed()}m`;
    }

    async isBlocked(key) {
        key = this.#generateBlockKey(key);
        const blockUntil = await this.#cacheService.get(key);
        if (blockUntil && compareDates(blockUntil, new Date()) > 0) {
            return true;
        } else if (blockUntil) {
            await this.#cacheService.delete(key);
        }
        return false;
    }

    async blockUser(key) {
        key = this.#generateBlockKey(key);
        const blockUntil = timeFromNow({[timeUnit.SECOND]: this.#blockTime}).toISOString();
        await this.#cacheService.set(key, blockUntil, this.#blockTime);
    }
}

module.exports = BlockerService;