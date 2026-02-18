import type { Request, Response } from "express"

import type { CreateSubmissionDto } from "../dtos/CreateSubmissionDto.js"

export function addSubmission(req: Request, res: Response) {
    const submissionDto = req.body as CreateSubmissionDto
    
    //TODO: Add validation using zod.

    return res.status(201).json({ 
        success: true,
        error: {},
        message: 'Successfully collected the submission',
        data: submissionDto
    })
}