import socket from "../config/socketClient.ts";

export function establishSocketConnection(userId: string) {
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.emit('setUserId', userId);

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on("submissionPayloadResponse", (data) => {
        console.log(data);
    });

    socket.on('error', (error: Error) => {
        console.error('Socket error:', error);
    });

    socket.on('message', (message: string) => {
        console.log('Message from server:', message);
    });
}

export function onSubmissionResponse(callback: (data: any) => void) {
    socket.off("submissionPayloadResponse"); // Remove previous listeners to avoid duplicates
    socket.on("submissionPayloadResponse", callback);
}

export function disconnectSocket() {
    socket.disconnect();
}