import submissionQueue from '../queues/submissionQueue.js'

export default async function (payload) {
    const queueResponse =  await submissionQueue.add('SubmissionJob', payload);
    console.log("successfully added a new submission job");
    return queueResponse;
}