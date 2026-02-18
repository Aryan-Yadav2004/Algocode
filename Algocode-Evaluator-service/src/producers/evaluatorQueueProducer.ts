import evaluatorQueue from "../queues/evaluatorQueue.js";

export default async function(payload: Record<string, unknown>){
    await evaluatorQueue.add("EvaluatorJob",payload);
    console.log("Job added to evaluator queue successfully.");
}