import {Job, Worker } from 'bullmq';

import redisConnection from '../config/redis.config.js';
import SubmissionJob from '../jobs/SubmissionJob.js';



export function SubmissionWorker(queueName: string) {
    new Worker<Record<string, string>>(queueName, async (job: Job) => {
        if (job.name === 'SubmissionJob') {
            const submissionJobInstance = new SubmissionJob(job.data); // ✅ now typed
            await submissionJobInstance.handle(job);
            return true;
        }
    },{connection: redisConnection});
}