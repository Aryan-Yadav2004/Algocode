import {Job, Worker } from 'bullmq'

import redisConnection from '../config/redis.config.js'
import SampleJob from '../jobs/SampleJob.js'

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function SampleWorker(queueName: string) {
    new Worker<Record<string, string>>(queueName, async (job: Job) => {
        if (job.name === 'SampleJob') {
            const sampleJobInstance = new SampleJob(job.data) // ✅ now typed
            sampleJobInstance.handle(job)
            await delay(1000)
            return true
        }
    },{connection: redisConnection})
}