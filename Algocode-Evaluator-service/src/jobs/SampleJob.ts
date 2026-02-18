// import type { Job } from 'bullmq';

import type { Job } from 'bullmq'

import type { IJob } from '../types/bullMqJobDefination.js'

export default class SampleJob implements IJob {
    name: string
    payload?: Record<string, unknown>
    constructor(payload: Record<string,unknown>){
        this.payload = payload
        this.name = this.constructor.name
    }

    handle = (job?: Job): void => {
        console.log('Handler of the job called')
        console.log(this.payload)
        if (job) {
            console.log(job.id)
        }
    }

    failed = (job?: Job): void => {
        console.log('Job failed')
        if (job) {
            console.log(job.id)
        }
    }

}