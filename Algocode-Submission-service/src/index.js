import Fastify from 'fastify';
import app from './app.js';
import * as serviceConfig from './config/serverConfig.js';
import connnectToDB from './config/dbConfig.js';
import EvaluatorWorker from './worker/evaluatorWorker.js';
import { evaluator_queue } from './config/constants.js';

const fastify = Fastify({ 
    logger: true,
    routerOptions: {
        ignoreTrailingSlash: true 
    }
});

fastify.register(app);

const PORT = Number(serviceConfig.PORT) || 3001;
const HOST = '0.0.0.0';

try {
    await fastify.listen({ port: PORT, host: HOST });
    console.log(`[SubmissionService] Successfully listening on ${HOST}:${PORT}`);
    await connnectToDB();
    console.log(`[SubmissionService] Connected to DB successfully`);
    EvaluatorWorker(evaluator_queue);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
} 