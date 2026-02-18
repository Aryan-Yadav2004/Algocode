import Fastify from 'fastify';
import app from './app.js';
import * as serviceConfig from './config/serverConfig.js';
import connnectToDB from './config/dbConfig.js';
import EvaluatorWorker from './worker/evaluatorWorker.js';
import { evaluator_queue } from './config/constants.js';

const fastify = Fastify({ logger: true }); //logger true krne se har request ka log automatically milta hai.


fastify.register(app);

fastify.listen({port: serviceConfig.PORT}, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);//current running program ko turant band karne
    }
    connnectToDB();
    console.log(`Server up at port ${serviceConfig.PORT}`);
    EvaluatorWorker(evaluator_queue);
}); 