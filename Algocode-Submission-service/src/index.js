import Fastify from 'fastify';
import app from './app.js';
import * as serviceConfig from './config/serverConfig.js';
import connnectToDB from './config/dbConfig.js';
import EvaluatorWorker from './worker/evaluatorWorker.js';
import { evaluator_queue } from './config/constants.js';

const fastify = Fastify({ 
    logger: true,
    ignoreTrailingSlash: true 
});

fastify.register(app);

fastify.listen({ port: Number(serviceConfig.PORT) || 3001, host: '0.0.0.0' }, async (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    await connnectToDB();
    console.log(`Server up at port ${serviceConfig.PORT || 3001}`);
    EvaluatorWorker(evaluator_queue);
}); 