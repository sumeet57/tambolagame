// socket.js

import io from "socket.io-client";

const socket = io.connect("https://freetambolagame.vercel.app"); // Adjust URL as needed

export default socket;
