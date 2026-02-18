import { Queue } from 'bullmq';

import redisConnection from '../config/redisConfig.js'

const submissionQueue =  new Queue('SubmissionQueue', {connection: redisConnection});

export default submissionQueue;