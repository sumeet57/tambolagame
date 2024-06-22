import React from "react";
import { Link } from "react-router-dom";

const App = () => {
  return (
    <div className="min-h-screen bg-zinc-800 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-medium tracking-wide mb-4 text-white p-2">
        Tambola Online Multiplayer
      </h1>
      <div className="flex space-x-4">
        <Link to="/host" className="bg-blue-500 text-white py-2 px-4 rounded">
          Host a Game
        </Link>
        <Link
          to="/player"
          className="bg-green-500 text-white py-2 px-4 rounded"
        >
          Join a Game
        </Link>
      </div>
    </div>
  );
};

export default App;
