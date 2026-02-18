import { Redis } from 'ioredis'

import * as serverConfig from './serverConfig.js'

const redisConfig = {
    port: serverConfig.REDIS_PORT,
    host: serverConfig.REDIS_HOST,
    maxRetriesPerRequest: null
}

const redisConnection = new Redis(redisConfig)

export default redisConnection;