import type { ErrorRequestHandler, NextFunction,Request, Response } from "express"

import logger from "../config/logger.config.js"

function errorHandler (err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) : Response {
    logger.error('Something went wrong')
    const body : number = Number(req.body) // value not read issue solver
    console.log(body)
    return res.status(500).json({
        success: false,
        message: "Something went wrong",
        error: err,
        data: {} // because this is an exception so no data is going to be provide
    })
    next() // value not read issue solver.
}

export default errorHandler