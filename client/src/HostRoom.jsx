import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import socket from "./socket";

const HostRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [players, setPlayers] = useState([]);
  const [roomPass, setRoomPass] = useState(location.state?.roomPass || "");
  const [name, setname] = useState(location.state?.name || "");

  useEffect(() => {
    const handleUpdatePlayers = (players) => {
      console.log("Received update-players event with players:", players);
      setPlayers(players);
    };

    const handleGameStarted = () => {
      navigate("/host/game", { state: { roomg: roomPass, nameg: name } });
    };

    socket.on("update-players", handleUpdatePlayers);
    socket.on("game-started", handleGameStarted);

    return () => {
      socket.off("update-players", handleUpdatePlayers);
      socket.off("game-started", handleGameStarted);
    };
  }, [navigate]);

  const handleStartGame = () => {
    if (roomPass) {
      socket.emit("start-game", roomPass);
    } else {
      console.error("Room password is not set.");
    }
  };

  return (
    <div
      className={` ${
        window.innerWidth <= 700 ? "w-[90%]" : "w-[50%]"
      } block text-center bg-black rounded-2xl`}
    >
      <div
        className={`text text-xl ${
          window.innerWidth < 450 ? "text-base" : "text-xl"
        } w-full h-fit p-2 scale-95 flex justify-between`}
      >
        <h2 className="font-medium p-2 uppercase">host room</h2>
        <div className="flex justify-center items-center">
          <p className="font-medium p-2 ">pass : {roomPass}</p>
          <button className="bg-white text-black pl-4 pr-4 font-bold p-1 uppercase mr-2 rounded-3xl text-base">
            <a
              class="wp-share"
              href={`whatsapp://send?text=Play Tambola with me, To Join us click on the LINK :  https://tambolagame.onrender.com/player?id=${roomPass}`}
            >
              Share
            </a>
          </button>
        </div>
      </div>
      <div className="w-full border-2 text-2xl relative border-white scale-95 mt-2 h-[300px] p-4 flex flex-wrap whitespace-normal">
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
      <button
        onClick={handleStartGame}
        className="bg-red-500 p-2 m-2 rounded-xl font-bold capitalize text-2xl hover:scale-95"
      >
        Start Game
      </button>
    </div>
  );
};

export default HostRoom;
