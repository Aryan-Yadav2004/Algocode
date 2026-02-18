import fastifyPlugin from 'fastify-plugin';//helps to create plugins
import cors from '@fastify/cors';
import servicePlugin from './services/servicePlugin.js';
import apiRoutes from './routes/api/apiRoutes.js'
import repositoryPlugin from './repositories/repositoryPlugin.js';
/**
 * 
 * @param {Fastify object} fastify 
 * @param {*} options 
 */

async function app(fastify, options) { 
    await fastify.register(cors, {origin: '*'});
    await fastify.register(repositoryPlugin);
    // register test routes 
    await fastify.register(apiRoutes, {prefix: '/api'});

    await fastify.register(servicePlugin);
}

export default fastifyPlugin(app);