import { createSubmission, getSubmissionsForProblemForUser } from "../../../controllers/submissionController.js";

async function submissionRoutes(fastify, options) {
    fastify.post('/', createSubmission);
    fastify.get('/',getSubmissionsForProblemForUser);
}

export default submissionRoutes;