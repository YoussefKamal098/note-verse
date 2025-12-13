require('module-alias/register');
const cluster = require('cluster');
const {REACTION_STREAM_SHARD_COUNT} = require("@/constants/reaction.constants")
const container = require("@/container");

if (cluster.isMaster) {
    // ---- MASTER PROCESS: FORK WORKERS ----
    console.log(`Master PID ${process.pid} starting ${REACTION_STREAM_SHARD_COUNT} shards...`);

    for (let shardId = 0; shardId < REACTION_STREAM_SHARD_COUNT; shardId++) {
        cluster.fork({
            ...process.env,
            SHARD_ID: shardId,
            SHARD_COUNT: REACTION_STREAM_SHARD_COUNT
        });
    }

    cluster.on('exit', (worker) => {
        console.log(`Worker ${worker.process.pid} exited. Restarting...`);
        // Auto restart worker
        cluster.fork(worker.process.env);
    });

} else {
    // ---- WORKER PROCESS ---- //
    const redis = require('@/config/redis');
    const ReactionConsumer = require('@/services/reaction/reaction.consumer');
    const reactionRepo = container.resolve("reactionRepo");
    const reactionCache = container.resolve("reactionCache");

    (async () => {
        const shardId = Number(process.env.SHARD_ID || 0);
        const shardCount = Number(process.env.SHARD_COUNT || 1);

        console.log(`Worker PID ${process.pid} starting ReactionConsumer for shard ${shardId}/${shardCount - 1}`);

        const consumer = new ReactionConsumer({
            redis,
            cache: reactionCache,
            repo: reactionRepo,
            shard: shardId,
            group: 'rg',
            consumer: `consumer-${shardId}-${process.pid}`,
            batchSize: 1000
        });

        await consumer.start();
    })();
}
