import { Worker } from "bullmq";
import EvaluatorJob from "../jobs/evaluatorJob.js";
import redisConnection from "../config/redisConfig.js";

export default function EvaluatorWorker(queueName) {
    new Worker(queueName, async (job) => {
        if(job.name === "EvaluatorJob"){
            console.log(job.data);
            const evaluatorJobInstance = new EvaluatorJob(job.data);
            evaluatorJobInstance.handle();
        }
    },{connection: redisConnection});
}