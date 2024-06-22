// socket.js

import io from "socket.io-client";

const socket = io.connect("https://tambolagameapi.vercel.app/"); // Adjust URL as needed

export default socket;
