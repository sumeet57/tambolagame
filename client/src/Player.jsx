import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Outlet } from "react-router-dom";
import socket from "./socket"; // Import centralized socket instance

const Player = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  // const [numbers, setNumbers] = useState([]);
  const [error, setError] = useState("");

  const joinRoom = () => {
    socket.emit("join-room", { room: pass, name: name });
  };

  useEffect(() => {
    const handleRoomJoined = ({ room, name }) => {
      console.log("Joined room:", room);
      setName(name); // Set the name state here
      navigate(`/player/room`, { state: { pname: name } });
    };

    const handleError = (errorMessage) => {
      console.error("Error joining room:", errorMessage);
      setError(errorMessage);
    };

    // const handleNumberAnnounced = (number) => {
    //   console.log("Number announced:", number); // Log the received number
    //   setNumbers((prevNumbers) => [number, ...prevNumbers]);
    // };

    socket.on("room-joined", handleRoomJoined);
    socket.on("error", handleError);
    // socket.on("number-announced", handleNumberAnnounced);

    return () => {
      socket.off("room-joined", handleRoomJoined);
      socket.off("error", handleError);
      // socket.off("number-announced", handleNumberAnnounced);
    };
  }, [navigate]);

  const handleJoinClick = () => {
    if (name.length < 3) {
      alert("Name should be 3 characters or more");
    } else {
      joinRoom();
    }
  };

  return (
    <div className="bg-black w-full h-screen flex justify-center items-center">
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
            onClick={handleJoinClick}
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
