import Docker from 'dockerode';
import { PassThrough } from 'stream';
import * as tar from 'tar-stream';

import type DockerStreamOutput from '../types/dockerStreamOutput.js';
import { DOCKER_STREAM_HEADER_SIZE } from '../utils/constanst.js';

// ---------------------------------------------------------------------------
// decodeDockerStream — existing helper (unchanged)
// ---------------------------------------------------------------------------

/**
 * Parses the Docker multiplexed stream format.
 * Each chunk has an 8-byte header:
 *   byte[0]   = stream type (1 = stdout, 2 = stderr)
 *   bytes[4-7]= uint32 big-endian length of the payload
 */
export default function decodeDockerStream(buffer: Buffer): DockerStreamOutput {
    let offset = 0;
    const output: DockerStreamOutput = { stdout: '', stderr: '' };

    while (offset < buffer.length) {
        const typeOfStream = buffer[offset];
        const length = buffer.readUInt32BE(offset + 4);
        offset += DOCKER_STREAM_HEADER_SIZE;

        if (typeOfStream === 1) {
            output.stdout += buffer.toString('utf-8', offset, offset + length);
        } else if (typeOfStream === 2) {
            output.stderr += buffer.toString('utf-8', offset, offset + length);
        }

        offset += length;
    }
    return output;
}

// ---------------------------------------------------------------------------
// createTarStream — build an in-memory tar with a single file
// ---------------------------------------------------------------------------

/**
 * Creates a readable tar stream containing a single file.
 * Used to safely inject code into a container via putArchive(),
 * bypassing the shell entirely (no escaping needed).
 */
export function createTarStream(fileName: string, content: string): PassThrough {
    const pack = tar.pack();
    const fileBuffer = Buffer.from(content, 'utf-8');

    pack.entry({ name: fileName, size: fileBuffer.length }, fileBuffer, (err) => {
        if (err) pack.destroy(err);
        else pack.finalize();
    });

    const passThrough = new PassThrough();
    pack.pipe(passThrough);
    return passThrough;
}

// ---------------------------------------------------------------------------
// writeFileToContainer — safely inject a file into a running container
// ---------------------------------------------------------------------------

/**
 * Writes `content` as `fileName` inside the container at `destPath`.
 * Uses Docker's putArchive API — the content never touches a shell.
 *
 * @param container  - running Dockerode container instance
 * @param fileName   - filename inside the archive (e.g. 'main.cpp')
 * @param content    - file content (raw source code string)
 * @param destPath   - destination directory inside container (default: '/sandbox')
 */
export async function writeFileToContainer(
    container: Docker.Container,
    fileName: string,
    content: string,
    destPath = '/sandbox',
): Promise<void> {
    const tarStream = createTarStream(fileName, content);
    await container.putArchive(tarStream, { path: destPath });
}

// ---------------------------------------------------------------------------
// runExec — run a command inside a running container and collect output
// ---------------------------------------------------------------------------

export type ExecResult = {
    stdout: string;
    stderr: string;
    exitCode: number;
};

/**
 * Executes a command inside an already-running container via `docker exec`.
 * Captures stdout and stderr multiplexed stream without fragile stdin socket hijacking.
 * (Test case input is fed safely via input.txt file redirection before calling runExec).
 * Rejects with 'TLE' string if `timeoutMs` elapses before the exec finishes.
 *
 * @param container  - running Dockerode container
 * @param cmd        - command array e.g. ['sh', '-c', './main < input.txt'] or ['g++', 'main.cpp', '-o', 'main']
 * @param timeoutMs  - per-exec timeout in ms
 * @param workDir    - working directory inside the container
 */
export function runExec(
    container: Docker.Container,
    cmd: string[],
    timeoutMs: number,
    workDir = '/sandbox',
): Promise<ExecResult> {
    return new Promise((resolve, reject) => {
        let settled = false;

        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                reject('TLE'); // Time Limit Exceeded
            }
        }, timeoutMs);

        container
            .exec({
                Cmd: cmd,
                AttachStdin: false,
                AttachStdout: true,
                AttachStderr: true,
                WorkingDir: workDir,
            })
            .then((exec) => {
                return exec.start({ hijack: true });
            })
            .then((stream) => {
                const rawBuffers: Buffer[] = [];
                stream.on('data', (chunk: Buffer) => rawBuffers.push(chunk));

                stream.on('end', () => {
                    if (settled) return;
                    clearTimeout(timer);
                    settled = true;

                    const decoded = decodeDockerStream(Buffer.concat(rawBuffers));
                    resolve({
                        stdout: decoded.stdout,
                        stderr: decoded.stderr,
                        exitCode: decoded.stderr ? 1 : 0,
                    });
                });

                stream.on('error', (err: Error) => {
                    if (settled) return;
                    clearTimeout(timer);
                    settled = true;
                    reject(err);
                });
            })
            .catch((err) => {
                if (settled) return;
                clearTimeout(timer);
                settled = true;
                reject(err);
            });
    });
}
