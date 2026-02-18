import express from 'express'

import serverAdapter from '../../config/bullboard.config.js'
import { pingCheck } from '../../controllers/pingController.js'
import submissionRouter from './submissionRoutes.js'

const v1Router = express.Router()

v1Router.use('/admin/queues', serverAdapter.getRouter())

v1Router.use('/submissions', submissionRouter)

v1Router.get('/ping',pingCheck)



export default v1Router