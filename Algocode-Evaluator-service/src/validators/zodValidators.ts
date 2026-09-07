import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodIssue, type ZodSchema } from 'zod';

/**
 * Generic Zod validation middleware factory.
 * Parses req.body against the given schema.
 *
 * On success: calls next() to proceed to the route handler.
 * On ZodError: returns 400 with a clean, field-level error list.
 * On unexpected error: forwards to the Express error handler via next(err).
 *
 * Previously sent the raw Zod error object directly, which:
 *  - Leaked internal Zod structure and stack traces to API callers
 *  - Produced an unreadable response (deeply nested `issues` array)
 *
 * Now returns:
 *  { errors: [{ field: 'userId', message: 'Required' }, ...] }
 */
export const validateCreateSubmissionDto =
    (schema: ZodSchema) =>
    (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                // Map each Zod issue to a simple { field, message } object
                // (.issues is the canonical typed property; .errors is an alias)
                const fieldErrors = error.issues.map((issue: ZodIssue) => ({
                    field: issue.path.join('.') || 'root',
                    message: issue.message,
                }));
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: fieldErrors,
                    data: {},
                });
            }
            // Unexpected non-Zod error — pass to global Express error handler
            next(error as Error);
        }
    };