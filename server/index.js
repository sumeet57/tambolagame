import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "http";

const app = express();
const port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adjust as per your frontend origin
    methods: ["GET", "POST"],
  },
});

const activeRooms = {};

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("create-room", (data) => {
    if (activeRooms[data.room]) {
      socket.emit("error", "Room already has a host");
    } else {
      try {
        activeRooms[data.room] = { host: socket.id, players: [] };
        activeRooms[data.room].players.push(data.name);
        socket.join(data.room);
        console.log(
          socket.id,
          "created and joined the room:",
          data.room,
          "by",
          data.name
        );
        socket.emit("room-created", data.room); // Emit the room name
      } catch (error) {
        console.error("Error joining room:", error);
        socket.emit("error", "Failed to create room"); // Inform client
      }
    }
  });

  socket.on("join-room", (data) => {
    if (!activeRooms[data.room]) {
      socket.emit("error", "Room does not exist");
    } else {
      activeRooms[data.room].players.push(data.name);
      socket.join(data.room);
      console.log(socket.id, "joined the room:", data.room, "by", data.name);
      socket.emit("room-joined", { room: data.room, name: data.name });
      io.to(data.room).emit("update-players", activeRooms[data.room].players);
    }
  });

  socket.on("start-game", (room) => {
    io.to(room).emit("game-started", room);
  });

  //number sharing

  socket.on("generate-number", ({ room, no }) => {
    socket.join(room);
    io.to(room).emit("number-announced", no);
  });

  socket.on("claimfromplayer", (data) => {
    io.emit("claimcome", data); // Broadcast to all clients
  });

  // Socket disconnect
  socket.on("disconnect", () => {
    console.log("disconnected", socket.id);
    for (let room in activeRooms) {
      if (activeRooms[room].host === socket.id) {
        delete activeRooms[room];
        io.to(room).emit("host-disconnected");
      } else {
        const index = activeRooms[room].players.indexOf(socket.id);
        if (index !== -1) {
          activeRooms[room].players.splice(index, 1);
          io.to(room).emit("update-players", activeRooms[room].players);
        }
      }
    }
  });
});

app.use(cors());

server.listen(port, () => {
  console.log("server is running on : ", port);
});
