// socket.js

import { io } from "socket.io-client";

const socket = io("https://tambolagame.onrender.com/", {
  transports: ["websocket", "polling"],
});

// const socket = io("http://localhost:3000", {
//   transports: ["websocket", "polling"],
// });

export default socket;
