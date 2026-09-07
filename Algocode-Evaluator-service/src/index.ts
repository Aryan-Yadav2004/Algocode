import bodyParser from 'body-parser';
import express from 'express';

import logger from './config/logger.config.js';
import serverConfig from './config/server.config.js';
import pullImage from './containers/pullImage.js';
import apiRouter from './routes/index.js';
import { CPP_IMAGE, JAVA_IMAGE, PYTHON_IMAGE, submission_queue } from './utils/constanst.js';
import errorHandler from './utils/errorHandler.js';
import { SubmissionWorker } from './workers/SubmissionWorker.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.text());

app.use('/api', apiRouter);

app.use(errorHandler);

app.listen(serverConfig.PORT, () => {
    logger.info(`[Server] Started on port ${serverConfig.PORT}`);

    // Warmup: pull all 3 Docker images in parallel when the server starts.
    // This ensures images are local before any submission job runs, so executors
    // don't need to call pullImage() individually on every submission.
    //
    // Each image failure is caught independently — one bad image doesn't block others.
    // The worker starts alongside the warmup (not after), so startup time is unaffected.
    void Promise.all([
        pullImage(CPP_IMAGE).catch(err =>
            logger.error(`[Warmup] Failed to pull ${CPP_IMAGE}: ${err.message}`),
        ),
        pullImage(JAVA_IMAGE).catch(err =>
            logger.error(`[Warmup] Failed to pull ${JAVA_IMAGE}: ${err.message}`),
        ),
        pullImage(PYTHON_IMAGE).catch(err =>
            logger.error(`[Warmup] Failed to pull ${PYTHON_IMAGE}: ${err.message}`),
        ),
    ]).then(() => {
        logger.info('[Warmup] All Docker images ready');
    });

    // Start the BullMQ worker and store the reference for graceful shutdown
    const worker = SubmissionWorker(submission_queue);

    // Graceful shutdown — lets in-flight jobs finish before the process exits.
    // Without this, a job could be killed mid-container execution, leaving
    // orphaned Docker containers running on the host.
    const shutdown = async (signal: string) => {
        logger.info(`[Server] ${signal} received — closing worker gracefully`);
        await worker.close();
        logger.info('[Server] Worker closed. Exiting.');
        process.exit(0);
    };

    process.on('SIGTERM', () => void shutdown('SIGTERM'));
    process.on('SIGINT',  () => void shutdown('SIGINT'));
});
