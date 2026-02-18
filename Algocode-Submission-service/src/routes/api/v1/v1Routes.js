import submissionRoutes from "./submissionRoutes.js";

async function v1Plugin(fastify, options) {
    fastify.register(submissionRoutes, {prefix: '/submission'});
}

export default v1Plugin;