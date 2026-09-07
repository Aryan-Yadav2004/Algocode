import type { NextFunction, Request, Response } from 'express';

import logger from '../config/logger.config.js';

/**
 * Express global error handler — the last middleware in the chain.
 * Receives any error passed to next(err) from routes/controllers.
 *
 * Key rules:
 *  1. Always log the FULL error (with stack) internally via Winston
 *  2. Never send internal details (stack traces, DB strings) to the client
 *  3. The `_next` param must be declared even if unused — Express identifies
 *     a 4-argument middleware as an error handler based on the arity (argument count)
 */
function errorHandler(
    err: Error,              // corrected: was ErrorRequestHandler (type of the handler fn, not the error)
    req: Request,
    res: Response,
    _next: NextFunction,     // prefixed _ = intentionally unused; required for Express to recognise as error handler
): void {
    // Log full error internally — stack trace, method, path for traceability
    logger.error(`[ErrorHandler] ${req.method} ${req.path} — ${err.message}`);
    if (err.stack) {
        logger.error(err.stack);
    }

    // Send a SAFE minimal response to the caller — no stack traces, no internals
    res.status(500).json({
        success: false,
        message: 'An internal server error occurred',
        error: {
            name: err.name,       // e.g. "InternalServerError" — safe to expose
            message: err.message, // just the message string — no stack trace
        },
        data: {},
    });
    // Note: no next() call — this is a terminal handler, nothing comes after
}

export default errorHandler;