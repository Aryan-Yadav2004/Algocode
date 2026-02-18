import SubmissionService from './submissionService.js';
import fastifyPlugin from 'fastify-plugin';
async function servicePlugin(fastify, options) {
    fastify.decorate('submissionService', new SubmissionService(fastify.submissionRepository));
}

export default fastifyPlugin(servicePlugin);