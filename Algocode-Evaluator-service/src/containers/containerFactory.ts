import Docker from 'dockerode';

/**
 * Creates a Docker container configured for sandboxed code execution.
 *
 * Design decisions:
 *  - No network access (NetworkMode: 'none') — prevents exfiltration
 *  - 256 MB memory limit — sufficient for competitive programming problems
 *  - CPU quota: 50% of one core (cpuQuota/cpuPeriod) — prevents monopolising host
 *  - /sandbox working directory is created so executors have a clean space
 *  - pullImage is NOT called here; executors call it before createContainer
 *    so we don't double-pull within the same execution.
 */
async function createContainer(imageName: string, cmdExecutable: string[]) {
    const docker = new Docker();

    const container = await docker.createContainer({
        Image: imageName,
        Cmd: cmdExecutable,
        // stdin/stdout/stderr are NOT attached at container level —
        // each exec() call attaches its own streams.
        AttachStdin: false,
        AttachStdout: false,
        AttachStderr: false,
        Tty: false,
        WorkingDir: '/sandbox',
        HostConfig: {
            Memory: 512 * 1024 * 1024,       // 512 MB — prevents OOM on g++ (#include <bits/stdc++.h> -O2) and JVM startup
            MemorySwap: 512 * 1024 * 1024,    // disable swap
            CpuPeriod: 100_000,               // 100ms period
            CpuQuota: 50_000,                 // 50ms → 50% of 1 core
            NetworkMode: 'none',              // no outbound network
            ReadonlyRootfs: false,            // need write access for /sandbox
            PidsLimit: 64,                    // prevent fork bombs
        },
    });

    return container;
}

export default createContainer;