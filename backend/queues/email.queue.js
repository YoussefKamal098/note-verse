const Queue = require('bull');
const config = require('../config/config');
const emailWorker = require('./email.worker');
const logger = require('../services/logger.service');

// Initialize Bull Queue with default job options
const emailQueue = new Queue('emailQueue', {
    redis: config.redisUri,
    defaultJobOptions: {
        attempts: 3,        // Retry up to 3 times
        backoff: 5000,      // Wait 5 seconds before retrying
        removeOnComplete: true,
        removeOnFail: false
    }
});

// Process email jobs with concurrency of 5
emailQueue.process(5, async (job) => {
    try {
        // Add an [EMAIL] tag for easy extraction
        logger.info(`[EMAIL] [PROCESS] Processing email job (ID: ${job.id}) for recipient: ${job.data.to}`);
        await emailWorker.processEmail(job.data);
        logger.info(`[EMAIL] [PROCESS] Email job (ID: ${job.id}) for ${job.data.to} completed successfully.`);
    } catch (error) {
        logger.error(`[EMAIL] [ERROR] Email job (ID: ${job.id}) for ${job.data.to} failed: ${error.message}`);
        throw error; // Let Bull handle retries
    }
});

// Retry failed jobs up to 3 times with exponential backoff
emailQueue.on('failed', async (job, err) => {
    if (job.attemptsMade < 3) {
        logger.warn(`[EMAIL] [RETRY] Retrying email job (ID: ${job.id}) for ${job.data.to} (Attempt ${job.attemptsMade + 1}/3)`);
    } else {
        logger.error(`[EMAIL] [FAILED] Email job (ID: ${job.id}) for ${job.data.to} permanently failed after 3 attempts: ${err.message}`);
    }
});

// Export queue
module.exports = emailQueue;
