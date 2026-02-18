import SubmissionRepository from "./submissionRepository.js";
import fastifyPlugin from "fastify-plugin";
async function  repositoryPlugin(fastify, options) {
    fastify.decorate('submissionRepository', new SubmissionRepository());
}

export default fastifyPlugin(repositoryPlugin);