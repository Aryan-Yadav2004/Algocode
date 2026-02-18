import v1Plugin from "./v1/v1Routes.js";

async function apiRoutes(fastify, options) {
    fastify.register(v1Plugin, {prefix: '/v1'});
}

export default apiRoutes;