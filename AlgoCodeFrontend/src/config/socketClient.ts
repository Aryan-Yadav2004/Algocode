import { io } from "socket.io-client";
import { cleanBaseUrl } from "../utils/urlHelper";

const rawSocketUrl = cleanBaseUrl(import.meta.env.VITE_SOCKET_URL);
const socketUrl = rawSocketUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3004');
const socket = io(socketUrl);

export default socket;