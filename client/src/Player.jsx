import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import socket from "./socket";
import { useSearchParams } from "react-router-dom";

const Player = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("id");

  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const joinRoom = (room, playerName) => {
    socket.emit("join-room", { room, name: playerName });
  };

  useEffect(() => {
    const handleRoomJoined = ({ room, name }) => {
      console.log("Joined room:", room);
      setName(name);
      navigate(`/player/room`, { state: { pname: name } });
    };

    const handleError = (errorMessage) => {
      console.error("Error joining room:", errorMessage);
      setError(errorMessage);
    };

    socket.on("room-joined", handleRoomJoined);
    socket.on("error", handleError);

    if (searchTerm) {
      setPass(searchTerm);
    }

    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("error", handleError);
    };
  }, [navigate, searchTerm]);

  const handleJoinClick = (roomPassword) => {
    if (name.length < 3) {
      alert("Name should be 3 characters or more");
    } else {
      joinRoom(roomPassword || pass, name);
    }
  };

  return (
    <div className="bg-teal-100 w-full h-screen flex justify-center items-center">
      {location.pathname === "/player" ? (
        <div className="cont flex justify-center items-center flex-col gap-5">
          <input
            value={name}
            className="w-[300px] h-[50px] text-black bg-white rounded-md p-1 text-base font-medium pl-2"
            type="text"
            placeholder="Enter your name"
            maxLength={20}
            onChange={(e) => {
              setName(e.target.value);
            }}
          />
          <input
            value={pass}
            className="w-[300px] h-[50px] text-black bg-white rounded-md p-1 text-base font-medium pl-2"
            placeholder="Enter room password"
            type="text"
            maxLength={10}
            onChange={(e) => {
              setPass(e.target.value);
            }}
          />
          <button
            onClick={() => handleJoinClick()}
            className="text-base text-black uppercase pl-4 pr-4 p-2 bg-blue-300 font-bold rounded-lg"
          >
            Join Room
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default Player;
