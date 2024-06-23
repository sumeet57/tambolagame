import React from "react";
import { Link } from "react-router-dom";
import "./mainpage.css";
import { FaFacebookF } from "react-icons/fa6";
import { FaLinkedinIn } from "react-icons/fa";
import { FiGithub } from "react-icons/fi";
import { FaInstagram } from "react-icons/fa";
import Header from "./Header";

const App = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-zinc-800 flex flex-col items-center justify-center p-4">
        <Header />
        <h1
          className={`header mb-10 -translate-y-10  ${
            window.innerHeight >= 700 ? "-translate-y-8" : "-translate-y-8"
          }`}
        >
          Tambola
        </h1>
        <p className="text-xl capitalize mb-10 ">
          online multiplayer tambola/bingo game for free
        </p>
        <div className="flex space-x-4">
          <Link
            to="/host"
            className="bg-blue-400 text-black font-bold py-2 px-4 rounded"
          >
            Host a Game
          </Link>
          <Link
            to="/player"
            className="bg-green-400 text-black font-bold py-2 px-4 rounded"
          >
            Join a Game
          </Link>
        </div>

        <div className="contact translate-y-20">
          <h2>design & develop by</h2>
          <div className="share flex justify-center items-center gap-5">
            <a
              class="tombollink3"
              href="https://www.instagram.com/sumeet.dev/"
              target="_blank"
              title="Send Message"
            >
              <FaInstagram />
            </a>
            <a
              class="tombollink3"
              href="https://www.linkedin.com/in/sumeet-umbalkar"
              target="_blank"
              title="Send Message"
            >
              <FaLinkedinIn />
            </a>
            <a
              class="tombollink3"
              href="https://github.com/sumeet57"
              target="_blank"
              title="Send Message"
            >
              <FiGithub />
            </a>
            <a
              class="tombollink3"
              href="https://www.facebook.com/profile.php?id=100073202520977"
              target="_blank"
              title="Send Message"
            >
              <FaFacebookF />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
