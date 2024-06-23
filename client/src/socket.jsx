// socket.js

import { io } from "socket.io-client";

const socket = io("https://tambolagame.onrender.com/", {
  transports: ["websocket", "polling"],
});

export default socket;
