import submissionQueueProducer from "../producers/submissionQueueProducer.js";
import InternalServerError from "../errors/internalServerError.js";
import { fetchProblemDetails } from "../apis/problemAdminApi.js";

class SubmissionService {
    constructor(submissionRepository) {
        this.submissionRepository = submissionRepository;
    }

    /**
     * Creates a new submission:
     * 1. Fetches problem details (test cases + code stubs) from Problem Service
     * 2. Wraps the user's code with the language-specific start/end snippets
     * 3. Saves to MongoDB with status "Pending"
     * 4. Pushes a SubmissionJob onto the BullMQ queue for the Evaluator Service
     *
     * No try/catch — errors propagate naturally to the controller.
     * Previously had a catch that returned {error} instead of throwing,
     * causing the controller to always send HTTP 201 even on failures.
     */
    async addSubmission(submissionPayload) {
        const problemId = submissionPayload.problemId;
        const problemAdminApiResponse = await fetchProblemDetails(problemId);

        if (!problemAdminApiResponse) {
            throw new InternalServerError('Problem not found or Problem Service unavailable');
        }

        const languageCodeStub = problemAdminApiResponse.data.codeStubs.find(
            codeStub => codeStub.language.toLowerCase() === submissionPayload.language.toLowerCase()
        );

        // Previously this was not guarded — would crash with an unreadable TypeError
        // "Cannot read properties of undefined (reading 'startSnippet')"
        if (!languageCodeStub) {
            throw new InternalServerError(
                `No code stub found for language "${submissionPayload.language}" on this problem`
            );
        }

        submissionPayload.code =
            languageCodeStub.startSnippet + '\n\n' +
            submissionPayload.code + '\n\n' +
            languageCodeStub.endSnippet;

        const submission = await this.submissionRepository.createSubmission(submissionPayload);

        if (!submission) {
            throw new InternalServerError('Failed to create submission record in database');
        }

        await submissionQueueProducer({
            [submission._id]: {
                userId: submission.userId,
                code: submission.code,
                language: submission.language,
                testCases: problemAdminApiResponse.data.testCases,
            }
        });

        return { submission };
    }

    /**
     * Updates the submission status in MongoDB after evaluation is complete.
     *
     * No try/catch — errors propagate to the caller (EvaluatorJob.handle).
     * Previously swallowed errors silently, leaving the DB in "Pending" state
     * while the user's socket would still show the final verdict.
     */
    async updateSubmissionStatus(submissionPayload) {
        const submission = await this.submissionRepository.updateSubmissionStatus(submissionPayload);
        return submission;
    }

    async getSubmissionForProblemForUser(submissionPayload) {
        try {
            const response = await this.submissionRepository.getSubmissionsForProblemForUser({
                userId: submissionPayload.userId,
                problemId: submissionPayload.problemId,
            });
            return response;
        } catch (error) {
            console.log(error);
        }
    }
}

export default SubmissionService;