import { Job, Worker } from 'bullmq';

import logger from '../config/logger.config.js';
import redisConnection from '../config/redis.config.js';
import SubmissionJob from '../jobs/SubmissionJob.js';

/**
 * Creates and starts a BullMQ worker that processes SubmissionJobs.
 *
 * Returns the Worker instance so the caller (index.ts) can close it
 * gracefully on SIGTERM/SIGINT — allowing in-flight jobs to finish
 * before the process exits.
 *
 * Event listeners are attached to make failures visible:
 *  - 'failed' fires when a job exhausts all its retries
 *  - 'error' fires on infrastructure errors (Redis disconnect etc.)
 */
export function SubmissionWorker(queueName: string): Worker {
    const worker = new Worker<Record<string, string>>(
        queueName,
        async (job: Job) => {
            if (job.name === 'SubmissionJob') {
                const submissionJobInstance = new SubmissionJob(job.data);
                await submissionJobInstance.handle(job);
            }
        },
        { connection: redisConnection },
    );

    // Job-level failure — fired after all retries are exhausted
    worker.on('failed', (job, err) => {
        logger.error(`[SubmissionWorker] Job ${job?.id ?? 'unknown'} permanently failed: ${err.message}`);
    });

    // Worker-level error — Redis disconnect, BullMQ internal errors etc.
    worker.on('error', (err) => {
        logger.error(`[SubmissionWorker] Worker infrastructure error: ${err.message}`);
    });

    logger.info(`[SubmissionWorker] Listening on queue: "${queueName}"`);
    return worker;
}