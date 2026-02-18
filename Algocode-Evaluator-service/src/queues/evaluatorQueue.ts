import { Queue } from "bullmq";

import redisConnection from "../config/redis.config.js";

const evaluatorQueue = new Queue("EvaluatorQueue", {connection: redisConnection});

export default evaluatorQueue;