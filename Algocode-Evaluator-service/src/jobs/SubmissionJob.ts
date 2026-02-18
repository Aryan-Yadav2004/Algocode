// import type { Job } from 'bullmq';

import type { Job } from 'bullmq';

import evaluatorQueueProducer from "../producers/evaluatorQueueProducer.js";
import type { IJob } from '../types/bullMqJobDefination.js';
import type { ExecutionResponse } from '../types/CodeExecutorStrategy.js';
import type { submissionPayload } from '../types/submissionPayload.js';
import createExecutor from '../utils/ExecutorFactory.js';

export default class SubmissionJob implements IJob {
    name: string
    payload?: Record<string, submissionPayload>
    constructor(payload: Record<string,submissionPayload>){
        this.payload = payload;
        this.name = this.constructor.name;
    }

    handle = async (job?: Job)  => {
        console.log('Handler of the job called');
        // console.log(this.payload);
        if (job && this.payload) { 
            const key = Object.keys(this.payload)[0]?.toString();
            if (key) {
                // console.log(this.payload[key]?.language);
                // if(this.payload[key]?.language === 'CPP'){
                //    const response = await runCpp(this.payload[key]?.code, this.payload[key]?.inputTestCase);
                //    console.log(response);
                // }
                const codeLanguage = this.payload[key]?.language;
                const code = this.payload[key]?.code;
                const testCases = this.payload[key]?.testCases;
                const userId = this.payload[key]?.userId;
                if(codeLanguage && code && testCases && userId) {
                    const strategy = createExecutor(codeLanguage);
                    if(strategy !== null) {
                        for(let i = 0; i < testCases.length; i++){
                            const testCase = testCases[i];
                            if(testCase && (testCase.input || testCase.input === "") && (testCase.output || testCase.output === "")) {
                                const response : ExecutionResponse = await  strategy.execute(code, testCase.input, testCase.output);
                                response.userId = userId;
                                response.submissionId = key;
                                if(response.status !== "SUCCESS"){
                                    console.log("Something went wrong with code execution");
                                    console.log(response);
                                    await evaluatorQueueProducer(response);
                                    return;
                                }
                                console.log(response);
                            }
                        }
                        await evaluatorQueueProducer({output: "", status: "SUCCESS", userId: userId, submissionId: key});
                    }
                }
            }
        }
    }

    failed = (job?: Job): void => {
        console.log('Job failed');
        if (job) {
            console.log(job.id);
        }
    }

}