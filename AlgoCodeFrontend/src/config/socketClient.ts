import { io } from "socket.io-client";

const socket = io('http://localhost:3004');

export default socket;