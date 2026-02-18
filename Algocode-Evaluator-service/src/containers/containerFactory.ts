import Docker from 'dockerode'

import pullImage from './pullImage.js'

async function createContainer(imageName: string, cmdExecutable: string[]) {
    const docker = new Docker()
    await pullImage(imageName);
    const container = await docker.createContainer({
        Image: imageName,
        Cmd: cmdExecutable,
        AttachStdin: true, // to enable input stream
        AttachStdout: true,// to enable output stream
        AttachStderr: true,// to enable error stream
        Tty: false,
        HostConfig: {
            Memory: 1024 * 1024 * 1024// 1GB
        }
    })
    return container
}

export default createContainer