import express from 'express'

import { addSubmission } from '../../controllers/sunmissionController.js'
import { createSubmissionZodSchema } from '../../dtos/CreateSubmissionDto.js'
import { validateCreateSubmissionDto } from '../../validators/zodValidators.js'


const  submissionRouter = express.Router()

submissionRouter.post('/',validateCreateSubmissionDto(createSubmissionZodSchema), addSubmission)

export default submissionRouter