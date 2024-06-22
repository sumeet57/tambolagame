import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import socket from "./socket";

// const socket = io.connect("http://localhost:3000");

const PlayerRoom = () => {
  const location = useLocation();
  const [val, setval] = useState(true);
  const [name, setname] = useState(location.state?.pname || "");

  // useEffect(() => {
  //   const intervalId = setInterval(() => {
  //     setval((prevval) => !prevval);
  //   }, 4000);

  //   return () => clearInterval(intervalId);
  // }, []);

  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    socket.on("update-players", (players) => {
      setPlayers(players);
    });

    socket.on("game-started", () => {
      navigate("/player/game", { state: { pname: name } });
    });

    return () => {
      socket.off("update-players");
      socket.off("game-started");
    };
  }, [navigate]);
  // socket.off("update-players");

  return (
    <div className="w-full block text-center">
      <div className="text w-full h-fit p-2 bg-zinc-600 scale-95 flex justify-between">
        <h2 className="font-medium text-4xl p-2 uppercase">players room</h2>
        <div className="flex justify-center items-center">
          <p className="font-medium text-4xl p-2 uppercase">pass :</p>
          <button className="bg-blue-400 p-1 uppercase font-medium mr-2 rounded-xl text-xl">
            share
          </button>
        </div>
      </div>
      <div className="w-full border-2 relative border-white scale-95 mt-2 h-[300px] p-4 flex flex-wrap whitespace-normal">
        {players.map((playerName, index) => (
          <p
            className="bg-zinc-600 p-2 w-auto h-fit text-xl capitalize rounded-xl m-2"
            key={index}
          >
            {playerName}
          </p>
        ))}
        <p className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] capitalize text-2xl opacity-50">
          waiting for players...
        </p>
      </div>
    </div>
  );
};

export default PlayerRoom;
