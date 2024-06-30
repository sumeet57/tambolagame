import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import socket from "./socket";

const Host = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const MIN_PASS_LENGTH = 3;

  const handleCreateRoom = () => {
    if (pass.length < MIN_PASS_LENGTH) {
      setError(`Password must be at least ${MIN_PASS_LENGTH} characters long.`);
      return;
    }

    // Remove existing listeners to avoid multiple event handlers being set
    socket.off("room-created");
    socket.off("error");

    // Emit room creation event
    socket.emit("create-room", { room: pass, name });

    // Handle room creation success
    socket.on("room-created", (room) => {
      navigate(`/host/room`, { state: { roomPass: room, name: name } }); // Pass the room password in the state
    });

    // Handle room creation error
    socket.on("error", (errorMessage) => {
      setError(errorMessage);
    });
  };

  return (
    <div className="bg-teal-100 w-full h-screen flex justify-center items-center">
      {location.pathname === "/host" ? (
        <div className="cont flex justify-center items-center flex-col gap-5">
          <input
            value={name}
            className="w-[300px] h-[50px] text-black bg-white rounded-md p-1 text-base font-medium pl-2"
            type="text"
            placeholder="Enter Your Name"
            maxLength={20}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <input
            value={pass}
            className="w-[300px] h-[50px] text-black bg-white rounded-md p-1 text-base font-medium pl-2"
            placeholder="Create room password"
            type="text"
            maxLength={10}
            onChange={(e) => {
              setPass(e.target.value);
            }}
          />
          <button
            onClick={handleCreateRoom}
            className="text-base font-semibold uppercase pl-2 pr-2 p-2 bg-green-300 text-black rounded-lg"
          >
            Create room
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Host;
