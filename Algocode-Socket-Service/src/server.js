const { createServer } = require('http');
const { Server } = require("socket.io");
const express = require("express");
const Redis = require("ioredis");

const app = express();
app.use(express.json());
const httpServer = createServer(app);

const redisHost = process.env.REDIS_HOST || '127.0.0.1';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);
const redisCache = new Redis({ host: redisHost, port: redisPort });

redisCache.on('connect', () => {
    console.log(`[SocketService] Connected to Redis successfully at ${redisHost}:${redisPort}`);
});

redisCache.on('error', (err) => {
    console.error('[SocketService] Redis connection error:', err.message);
});

const io = new Server(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || "*",
        methods: ['GET', 'POST'],
    }
});

io.on("connection", (socket) => {
    console.log("[SocketService] A user connected: " + socket.id);

    socket.on("setUserId", (userId) => {
        console.log(`[SocketService] set userId: ${userId} -> socketId: ${socket.id}`);
        redisCache.set(userId, socket.id);
    });

    socket.on("getConnectionId", async (userId) => {
        console.log(`[SocketService] get connectionId for userId: ${userId}`);
        const connId = await redisCache.get(userId);
        socket.emit("connectionId", connId);
    });
});

app.post('/sendPayload', async (req, res) => {
    const payload = req.body;
    if(!payload || !payload.userId) {
        return res.status(400).send("Invalid request");
    }

    const socketId = await redisCache.get(payload.userId);
    if(socketId) {
        io.to(socketId).emit("submissionPayloadResponse", payload);
        return res.send('Payload sent successfully');
    } else {
        return res.status(404).send("User not connected");
    }
});

const PORT = parseInt(process.env.PORT || '3004', 10);
const HOST = '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
    console.log(`[SocketService] Server is up and listening on ${HOST}:${PORT}`);
});