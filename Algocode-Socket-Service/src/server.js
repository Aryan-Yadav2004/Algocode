const { createServer } = require('http');
const { Server } = require("socket.io");
const express = require("express");
const Redis = require("ioredis");
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
const httpServer = createServer(app);

const redisCache = new Redis();// create redis client

const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ['GET', 'POST'],
    }
});

io.on("connection", (socket) => {
    console.log("A user connected " + socket.id);

    socket.on("setUserId", (userId) => {
        console.log(`set userId with ${userId}`);
        redisCache.set(userId, socket.id);
    });

    socket.on("getConnectionId", async (userId) => {
        console.log(`get userID with ${userId}`);
        const connId = await redisCache.get(userId);
        socket.emit("connectionId", connId);
    })
});

app.post('/sendPayload', async (req, res) => {
    console.log(req.body);
    const payload = req.body;
    if(!payload || !payload.userId) {
        res.status(400).send("Invalid request");
    }

    const socketId = await redisCache.get(payload.userId);
    if(socketId) {
        //to() --> targets the room when emiting.
        io.to(socketId).emit("submissionPayloadResponse", payload);
        res.send('Payload send successfully');
    }
    else{
        res.status(404).send("User not connected");
    }
});

httpServer.listen(3004, () => {
    console.log(`server is up at port 3004`);
});