import type { Job } from 'bullmq';

import evaluatorQueueProducer from '../producers/evaluatorQueueProducer.js';
import type { IJob } from '../types/bullMqJobDefination.js';
import type { ExecutionResponse } from '../types/CodeExecutorStrategy.js';
import type { submissionPayload } from '../types/submissionPayload.js';
import createExecutor from '../utils/ExecutorFactory.js';

/**
 * SubmissionJob — the BullMQ job handler for code evaluation.
 *
 * Responsibilities:
 *  1. Extract submission payload from the job data
 *  2. Create the appropriate language executor via ExecutorFactory
 *  3. Delegate ALL test cases to the executor in a single call
 *     (the executor manages the container lifecycle internally)
 *  4. Forward the final ExecutionResponse to the evaluator queue
 *
 * What this class does NOT do (by design):
 *  - It does NOT loop over test cases itself
 *  - It does NOT manage Docker containers
 *  - It does NOT know about TLE limits or language specifics
 *  → All of that is encapsulated in the executor (single responsibility)
 */
export default class SubmissionJob implements IJob {
    name: string;
    payload?: Record<string, submissionPayload>;

    constructor(payload: Record<string, submissionPayload>) {
        this.payload = payload;
        this.name = this.constructor.name;
    }

    handle = async (job?: Job): Promise<void> => {
        console.log('[SubmissionJob] Handler called');

        if (!job || !this.payload) return;

        // The payload key is the submissionId (set by the Submission Service)
        const submissionId = Object.keys(this.payload)[0]?.toString();
        if (!submissionId) {
            console.error('[SubmissionJob] No submissionId found in payload keys');
            return;
        }

        const submission = this.payload[submissionId];
        if (!submission) return;

        const { language, code, testCases, userId } = submission;

        if (!language || !code || !testCases || !userId) {
            console.error('[SubmissionJob] Incomplete submission payload', { language, userId, submissionId });
            return;
        }

        const strategy = createExecutor(language);
        if (!strategy) {
            console.error(`[SubmissionJob] No executor found for language: ${language}`);
            return;
        }

        console.log(`[SubmissionJob] Evaluating submissionId=${submissionId} language=${language} testCases=${testCases.length}`);

        // Single call — executor handles 1 container + N test case runs internally
        const response: ExecutionResponse = await strategy.execute(code, testCases, userId, submissionId);

        console.log(`[SubmissionJob] Evaluation complete — status: ${response.status}`);
        if (response.failedTestCase) {
            console.log(`[SubmissionJob] Failed at test case #${response.failedTestCase.testCaseIndex}`);
        }

        // Push result to the evaluator queue so Submission Service can
        // update MongoDB status and notify the user via Socket Service
        await evaluatorQueueProducer(response);
    };

    failed = (job?: Job): void => {
        console.error('[SubmissionJob] Job failed');
        if (job) {
            console.error('[SubmissionJob] Job id:', job.id);
        }
    };
}