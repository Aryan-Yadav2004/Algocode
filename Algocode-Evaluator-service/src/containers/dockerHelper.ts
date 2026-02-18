import type DockerStreamOutput from "../types/dockerStreamOutput.js"
import { DOCKER_STREAM_HEADER_SIZE } from "../utils/constanst.js"



export default function decodeDockerStream(buffer: Buffer) : DockerStreamOutput {
    let offset = 0 // this variable keeps track of the current position in the buffer while parsing

    // the output that will store the accumulated stdout and stderr output as strings.
    const output: DockerStreamOutput = { stdout: '', stderr: '' }


    // loop until offset reaches end of the buffer
    while(offset < buffer.length) {

        //typeOfStream is read from buffer and has value of type of stream
        const typeOfStream = buffer[offset];

        //This length variable hold the length of the value 
        // we will read this variable on an offset of 4 bytes from the start of the chunk
        // move forward four bytes we will get length of the data.
        const length = buffer.readUInt32BE(offset + 4);

        // as now we have read the header, we can move forward to the value of the chunk.
        offset += DOCKER_STREAM_HEADER_SIZE;

        if(typeOfStream === 1) {
            // stdout stream
            output.stdout += buffer.toString('utf-8', offset, offset + length);
        } else if(typeOfStream === 2){
            // stderr stream
            output.stderr += buffer.toString('utf-8', offset, offset + length);
        }

        offset += length;
    }
    return output;
}