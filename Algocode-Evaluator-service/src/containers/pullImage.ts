import Docker from 'dockerode';

import logger from '../config/logger.config.js';

/**
 * Pulls a Docker image from the registry if not already cached locally.
 * Safe to call even when the image is already present — Docker will no-op.
 *
 * Previously used try/catch + throw inside a callback, which is a Node.js anti-pattern:
 * `throw` inside a callback does NOT propagate to the surrounding try/catch.
 * The outer catch would silently return undefined, causing cryptic errors downstream.
 * Fixed by using reject() inside the callback to properly fail the Promise.
 */
export default function pullImage(imageName: string): Promise<void> {
    const docker = new Docker();
    return new Promise((resolve, reject) => {
        docker.pull(imageName, (err: Error, stream: NodeJS.ReadableStream) => {
            if (err) {
                reject(err); // correctly fails the Promise
                return;
            }
            docker.modem.followProgress(
                stream,
                (err: Error | null) => {
                    if (err) reject(err);
                    else resolve();
                },
                (event: { status: string }) => {
                    logger.info(`[pullImage] ${imageName}: ${event.status}`);
                },
            );
        });
    });
}