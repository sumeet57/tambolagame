import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import Host from "./Host.jsx";
import HostRoom from "./HostRoom.jsx";
import HostGame from "./HostGame.jsx";
import Player from "./Player.jsx";
import PlayerRoom from "./PlayerRoom.jsx";
import PlayerGame from "./PlayerGame.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/host" element={<Host />}>
          <Route path="room" element={<HostRoom />} />
          <Route path="game" element={<HostGame />} />
        </Route>
        <Route path="/player" element={<Player />}>
          <Route path="room" element={<PlayerRoom />} />
          <Route path="game" element={<PlayerGame />} />
        </Route>
      </Routes>
    </Router>
  </React.StrictMode>
);
