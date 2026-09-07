import SubmissionRepository from "../repositories/submissionRepository.js";
import SubmissionService from "../services/submissionService.js";

export default class EvaluatorJob {
    name;
    payload;

    constructor(payload) {
        this.payload = payload;
        this.name = this.constructor.name;
    }

    async handle() {
        console.log("[EvaluatorJob] Handler called — submissionId:", this.payload?.submissionId);

        const submissionServiceInstance = new SubmissionService(new SubmissionRepository());

        // Step 1: Update the submission status in DB.
        // Wrapped in its own try/catch — if this fails we still want to
        // send the socket notification so the user isn't left hanging forever.
        try {
            await submissionServiceInstance.updateSubmissionStatus(this.payload);
        } catch (error) {
            console.error("[EvaluatorJob] Failed to update submission status in DB:", error.message);
            // Note: we intentionally continue to Step 2 even on DB failure
        }

        // Step 2: Notify the user via Socket Service.
        // Separate try/catch — if socket call fails, the DB was already updated.
        const socketServiceUrl = process.env.SOCKET_SERVICE_URL ?? "http://localhost:3004";
        try {
            await fetch(`${socketServiceUrl}/sendPayload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(this.payload),
            });
        } catch (error) {
            console.error("[EvaluatorJob] Failed to notify Socket Service:", error.message);
        }
    }
}