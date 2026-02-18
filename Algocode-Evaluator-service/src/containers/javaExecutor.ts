// import Docker from 'dockerode';

// import type { TestCases } from '../types/testCases.js';
import type { ExecutionResponse } from '../types/CodeExecutorStrategy.js'
import type CodeExecutorStrategy from '../types/CodeExecutorStrategy.js'
import { JAVA_IMAGE } from '../utils/constanst.js'
import createContainer from './containerFactory.js'
import decodeDockerStream from './dockerHelper.js'


class JavaExecutor implements CodeExecutorStrategy {
    async execute(code: string, inputTestCase: string, outputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer: Buffer[] = [];
        console.log(code, inputTestCase, outputTestCase);
        console.log("initialising a new java container")
        const runCommand = `echo '${code.replace(/'/g, `'\\*'`)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(/'/g, `'\\*'`)}' | java Main`;
        // const pythonDockerContainer = await createContainer(PYTHON_IMAGE, ['python3','-c', code, 'stty -echo']);
        const javaDockerContainer = await createContainer(JAVA_IMAGE, ['/bin/sh', '-c', runCommand]);
        // starting / booting the corresponding docker container.
        await javaDockerContainer.start();

        console.log("Started the docker container");

        const loggerStream = await javaDockerContainer.logs({
            stdout: true,
            stderr: true,
            timestamps: false,
            follow: true, // wheather the logs are streamed or returned as a string
        });

        //Attach events on the streams object to start and stop reading
        loggerStream.on('data', (chunk) => {
            rawLogBuffer.push(chunk); 
        });

        try {
            const codeResponse : string  =  await this.fetchDecodedStream(loggerStream, rawLogBuffer );
            if(codeResponse.trim() === outputTestCase.trim()){
                return {output: codeResponse, status: "SUCCESS", userId: "", submissionId: ""};
            }
            else{
                return {output: codeResponse, status: "WA", userId: "", submissionId: ""};
            }
        } catch (error:any) {
            const errMsg: string = typeof error === "string" ? error : error.message;
            if(error === "TLE"){
                await javaDockerContainer.kill();
                return {output: "ERROR", status: "TLE", userId: "", submissionId: ""};
            }
            if(errMsg.includes("OutOfMemoryError")){//ye docker ka error issme explicitly kill nahi krna padta
                return {output: "ERROR", status: "MLE", userId: "", submissionId: ""};
            }
            console.log("Error occured", error);
            return {output: error as string, status: "ERROR", userId: "", submissionId: ""};
        } finally {
            await javaDockerContainer.remove(); 
        }
    }
    fetchDecodedStream(loggerStream: NodeJS.ReadableStream, rawLogBuffer: Buffer[]) : Promise<string> {
        
        
        return new Promise((res, rej) => {

            const timeout = setTimeout(() => {
                console.log("Timeout called");
                rej("TLE");
            }, 2000);//last time 1e9 pe tle and 1e8 pe work

            loggerStream.on('end',() => {
                //this callback execute when the stream ends
                // console.log(rawLogBuffer);
                clearTimeout(timeout);
                const completeBuffer = Buffer.concat(rawLogBuffer);
                const decodeStream = decodeDockerStream(completeBuffer);
                // console.log(decodeStream);
                if(decodeStream.stderr){
                    rej(decodeStream.stderr);
                }
                else {
                    res(decodeStream.stdout);
                }
            });
        });
    }
}

export default JavaExecutor ;