import { createBullBoard } from '@bull-board/api'
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter'
import { Queue } from 'bullmq'

import serverAdapter from '../config/bullboard.config.js'
import redisConnection from '../config/redis.config.js'


const submissionQueue =  new Queue('SubmissionQueue', {connection: redisConnection})

createBullBoard({queues: [new BullMQAdapter(submissionQueue)], serverAdapter: serverAdapter})

export default submissionQueue;