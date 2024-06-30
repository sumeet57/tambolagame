import React, { useState, useEffect } from "react";
import socket from "./socket";
import { useLocation } from "react-router-dom";
import e5img from "./assets/e5.png";
import e7img from "./assets/e7.png";
import fimg from "./assets/f.png";
import mimg from "./assets/m.png";
import limg from "./assets/l.png";
import cimg from "./assets/c.png";
import simg from "./assets/s.png";
import mnimg from "./assets/middleno.png";
import fullimg from "./assets/full.png";
import one43img from "./assets/143.png";
import pimg from "./assets/pimg.png";
import "./extra.css";
import { IoMdClose } from "react-icons/io";

// Generate random numbers between 1 and 90 (inclusive) for Tambola ticket
function generateRandomNumbers(count) {
  const numbers = new Set();
  while (numbers.size < count) {
    const randomNumber = Math.floor(Math.random() * 90) + 1;
    numbers.add(randomNumber);
  }
  return Array.from(numbers);
}

// Distribute numbers into three arrays (representing rows)
const arrangeNumbersInRows = (numbers) => {
  const rows = [Array(9).fill(null), Array(9).fill(null), Array(9).fill(null)];

  // Define column ranges
  const columnRanges = [
    { start: 1, end: 9 },
    { start: 10, end: 19 },
    { start: 20, end: 29 },
    { start: 30, end: 39 },
    { start: 40, end: 49 },
    { start: 50, end: 59 },
    { start: 60, end: 69 },
    { start: 70, end: 79 },
    { start: 80, end: 90 },
  ];

  // Function to get column index based on number range
  const getColumnIndex = (number) => {
    return columnRanges.findIndex(
      (range) => number >= range.start && number <= range.end
    );
  };

  // Distribute numbers into columns
  const columns = Array.from({ length: 9 }, () => []);

  numbers.forEach((number) => {
    const colIndex = getColumnIndex(number);
    columns[colIndex].push(number);
  });

  // Sort each column and distribute into rows
  columns.forEach((col) => col.sort((a, b) => a - b));

  // Ensure no duplicates across columns
  const usedNumbers = new Set();

  // Distribute numbers to rows
  let rowFills = [0, 0, 0];

  columns.forEach((col, colIndex) => {
    col.forEach((num) => {
      if (!usedNumbers.has(num)) {
        const minRowIndex = rowFills.indexOf(Math.min(...rowFills));
        rows[minRowIndex][colIndex] = num;
        rowFills[minRowIndex]++;
        usedNumbers.add(num);
      }
    });
  });

  // Ensure each row has exactly 5 numbers by moving excess numbers
  rows.forEach((row, rowIndex) => {
    let currentNumbers = row.filter((num) => num !== null).length;
    if (currentNumbers < 5) {
      const needed = 5 - currentNumbers;
      let added = 0;
      for (let col = 0; col < 9 && added < needed; col++) {
        if (row[col] === null) {
          for (let i = 0; i < 3; i++) {
            if (i !== rowIndex && rows[i][col] !== null) {
              row[col] = rows[i][col];
              rows[i][col] = null;
              added++;
              break;
            }
          }
        }
      }
    }
  });

  // Fill empty slots in rows with remaining numbers
  rows.forEach((row) => {
    const nonNulls = row.filter((num) => num !== null).length;
    if (nonNulls < 5) {
      const nullIndices = row
        .map((num, index) => (num === null ? index : -1))
        .filter((index) => index !== -1);

      for (let i = 0; i < 5 - nonNulls; i++) {
        for (let col = 0; col < 9; col++) {
          if (columns[col].length > 0) {
            const numToAdd = columns[col].shift();
            if (!usedNumbers.has(numToAdd)) {
              row[nullIndices[i]] = numToAdd;
              usedNumbers.add(numToAdd);
              break;
            }
          }
        }
      }
    }
  });

  return rows;
};

const PlayerGame = () => {
  const location = useLocation();
  const [name, setName] = useState(location.state?.pname || "");
  const [ticket, setTicket] = useState({ row1: [], row2: [], row3: [] });
  const [numbers, setNumbers] = useState([]);
  const [check, setCheck] = useState({ l1: [], l2: [], l3: [] });
  const [points, setPoints] = useState(0); // State for points
  const [line1, setLine1] = useState([]); // State for line 1 numbers
  const [line2, setLine2] = useState([]); // State for line 2 numbers
  const [line3, setLine3] = useState([]); // State for line 3 numbers
  const [claims, setClaims] = useState([]); // State for claims made
  const [playerData, setPlayerData] = useState([]); // State for player data
  const [allclaim, setAllClaim] = useState([]); // State for all claims
  const [click, setclick] = useState(0);
  // const [allclaim, setAllClaim] = useState([]);

  const [message, setmessage] = useState("");
  const [minput, setminput] = useState("");

  const sendbt = () => {
    if (click === 0) {
      socket.emit("sm", { message: minput, n: name });
      setminput("");
      timeoutmsg();
    }
  };

  useEffect(() => {
    const handleRmEvent = (data) => {
      setmessage(
        <span>
          <span style={{ color: "red", fontWeight: "400" }}>{data.n}</span> :{" "}
          {data.message}
        </span>
      ); // Update the message state with the new data
      setTimeout(() => {
        setmessage(""); // Clear the message after 4 seconds
      }, 3000);
    };

    socket.on("rm", handleRmEvent);

    return () => {
      socket.off("rm", handleRmEvent);
    };
  }, [message]);

  useEffect(() => {
    setLine1(ticket.row1.filter((n) => n).sort((a, b) => a - b));
    setLine2(ticket.row2.filter((n) => n).sort((a, b) => a - b));
    setLine3(ticket.row3.filter((n) => n).sort((a, b) => a - b));
  }, [ticket]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Cancel the event (prevents the browser from closing the tab/refreshing the page)
      event.preventDefault();
      // Prompt the user with a custom message
      const confirmationMessage =
        "Are you sure you want to refresh? Any unsaved changes will be lost.";
      event.returnValue = confirmationMessage;
      return confirmationMessage;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  //ticket generating
  useEffect(() => {
    const generatedNumbers = generateRandomNumbers(15);
    const [row1, row2, row3] = arrangeNumbersInRows(generatedNumbers);
    setTicket({ row1, row2, row3 });
  }, []);

  //declared number from host through socket
  // useEffect(() => {
  //   socket.on("number-announced", (number) => {
  //     console.log(number);
  //     setNumbers((prevNumbers) => [number, ...prevNumbers]);
  //   });

  //   return () => {
  //     socket.off("number-announced");
  //   };
  // }, []);

  const handleCheck = (row, number) => {
    if (numbers.includes(number)) {
      document.querySelectorAll(`.elem-${number}`).forEach((i) => {
        i.style.backgroundColor === "dimgray"
          ? (i.style.backgroundColor = "white")
          : (i.style.backgroundColor = "dimgray");
      });

      setCheck((prevCheck) => {
        const newCheck = { ...prevCheck };
        if (!newCheck[row].includes(number)) {
          newCheck[row] = [...newCheck[row], number];
        } else {
          newCheck[row] = newCheck[row].filter((num) => num !== number);
        }
        return newCheck;
      });
    }
  };
  useEffect(() => {
    socket.on("claimcome", (data) => {
      // Update allclaim state with the new claim data
      setAllClaim((prevAllClaim) => [...prevAllClaim, data.data]);
      setmessage(data.n + " completed " + data.message);
      setTimeout(() => {
        setmessage(""); // Clear the message after 4 seconds
      }, 2000);
      // Check if player already exists in playerData
      const playerIndex = playerData.findIndex(
        (player) => player.player === data.n
      );
      if (playerIndex !== -1) {
        // Player exists, update their points
        const updatedPlayerData = [...playerData];
        updatedPlayerData[playerIndex].points += data.p; // Assuming data.p is the points to be added
        setPlayerData(updatedPlayerData); // Update playerData state
      } else {
        // Player doesn't exist, add them to playerData
        setPlayerData((prevPlayerData) => [
          ...prevPlayerData,
          { player: data.n, points: data.p }, // Assuming data.p is the initial points
        ]);
      }
    });

    socket.on("number-announced", (number) => {
      setNumbers((prevNumbers) => [number, ...prevNumbers]);
    });

    return () => {
      socket.off("claimcome");
      socket.off("number-announced");
    };
  }, [playerData]); // Include playerData in dependencies array if it's used inside useEffect

  const fclick = () => {
    const { l1, l2, l3 } = check;
    if (
      l1.length >= line1.length &&
      !claims.includes("First Line Complete : 10 points") &&
      !allclaim.includes("f")
    ) {
      const updatedPoints = points + 10;
      setClaims((prevClaims) => [
        ...prevClaims,
        "First Line Complete : 10 points",
      ]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "f"]);
      socket.emit("claimfromplayer", {
        data: "f",
        message: "first line",
        n: name,
        p: updatedPoints,
      });
    }
  };

  const mclick = () => {
    const { l1, l2, l3 } = check;
    if (
      l2.length >= line2.length &&
      !claims.includes("middle Line Complete : 10 points") &&
      !allclaim.includes("m")
    ) {
      const updatedPoints = points + 10;
      setClaims((prevClaims) => [
        ...prevClaims,
        "middle Line Complete : 10 points",
      ]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "m"]);
      socket.emit("claimfromplayer", {
        data: "m",
        message: "middle line",
        n: name,
        p: updatedPoints,
      });
    }
  };

  const lclick = () => {
    const { l1, l2, l3 } = check;
    if (
      l3.length >= line3.length &&
      !claims.includes("last Line Complete : 10 points") &&
      !allclaim.includes("l")
    ) {
      const updatedPoints = points + 10;
      setClaims((prevClaims) => [
        ...prevClaims,
        "last Line Complete : 10 points",
      ]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "l"]);
      socket.emit("claimfromplayer", {
        data: "l",
        message: "last line",
        n: name,
        p: updatedPoints,
      });
    }
  };

  const e5click = () => {
    const { l1, l2, l3 } = check;
    if (
      l1.length + l2.length + l3.length === 5 &&
      !claims.includes("Early Five Complete : 20 points") &&
      !allclaim.includes("e5")
    ) {
      const updatedPoints = points + 20;
      setClaims((prevClaims) => [
        ...prevClaims,
        "Early Five Complete : 20 points",
      ]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "e5"]);
      socket.emit("claimfromplayer", {
        data: "e5",
        message: "early five",
        n: name,
        p: updatedPoints,
      });
    }
  };

  const e7click = () => {
    const { l1, l2, l3 } = check;
    if (
      l1.length + l2.length + l3.length === 7 &&
      !claims.includes("Early seven Complete : 15 points") &&
      !allclaim.includes("e7")
    ) {
      const updatedPoints = points + 15;
      setClaims((prevClaims) => [
        ...prevClaims,
        "Early seven Complete : 15 points",
      ]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "e7"]);
      socket.emit("claimfromplayer", {
        data: "e7",
        message: "early seven",
        n: name,
        p: updatedPoints,
      });
    }
  };

  const cclick = () => {
    const { l1, l2, l3 } = check;
    if (
      l1.includes(line1[0]) &&
      l1.includes(line1[line1.length - 1]) &&
      l3.includes(line3[0]) &&
      l3.includes(line3[line3.length - 1]) &&
      !claims.includes("Corner Complete : 20 points") &&
      !allclaim.includes("c")
    ) {
      const updatedPoints = points + 20;
      setClaims((prevClaims) => [...prevClaims, "Corner Complete : 20 points"]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "c"]);
      socket.emit("claimfromplayer", {
        data: "c",
        message: "corner",
        n: name,
        p: updatedPoints,
      });
    }
  };

  const sclick = () => {
    const { l1, l2, l3 } = check;
    if (
      l1.includes(line1[0]) &&
      l1.includes(line1[line1.length - 1]) &&
      l2.includes(line2[Math.floor(line2.length / 2)]) &&
      l3.includes(line3[0]) &&
      l3.includes(line3[line3.length - 1]) &&
      !claims.includes("Star Complete : 25 points") &&
      !allclaim.includes("s")
    ) {
      const updatedPoints = points + 25;
      setClaims((prevClaims) => [...prevClaims, "Star Complete : 25 points"]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "s"]);
      socket.emit("claimfromplayer", {
        data: "s",
        n: name,
        message: "star",
        p: updatedPoints,
      });
    }
  };

  const mnclick = () => {
    const { l1, l2, l3 } = check;
    if (
      l2.includes(line2[Math.floor(line2.length / 2)]) &&
      !claims.includes("Middle Number Complete : 10 points") &&
      !allclaim.includes("mn")
    ) {
      const updatedPoints = points + 10;
      setClaims((prevClaims) => [
        ...prevClaims,
        "Middle Number Complete : 10 points",
      ]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "mn"]);
      socket.emit("claimfromplayer", {
        data: "mn",
        message: "middle no",
        n: name,
        p: updatedPoints,
      });
    }
  };

  const fullclick = () => {
    const { l1, l2, l3 } = check;
    if (
      l1.length + l2.length + l3.length ===
        line1.length + line2.length + line3.length &&
      !claims.includes("Full House Complete : 30 points") &&
      !allclaim.includes("full")
    ) {
      const updatedPoints = points + 30;
      setClaims((prevClaims) => [
        ...prevClaims,
        "Full House Complete : 30 points",
      ]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "full"]);
      socket.emit("claimfromplayer", {
        data: "full",
        message: "full house",
        n: name,
        p: updatedPoints,
      });
    }
  };

  const one43click = () => {
    const { l1, l2, l3 } = check;
    if (
      l1.length >= 1 &&
      l2.length >= 4 &&
      l3.length >= 3 &&
      !claims.includes("143 Complete : 15 points") &&
      !allclaim.includes("onefourthree")
    ) {
      const updatedPoints = points + 15;
      setClaims((prevClaims) => [...prevClaims, "143 Complete : 15 points"]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "onefourthree"]);
      socket.emit("claimfromplayer", {
        data: "onefourthree",
        message: "143",
        n: name,
        p: updatedPoints,
      });
    }
  };
  const pclick = () => {
    const { l1, l2, l3 } = check;
    if (
      l1.length >= 1 &&
      l2.length >= line2.length - 2 &&
      l3.length >= line3.length &&
      !claims.includes("Pyramid Complete : 15 points") &&
      !allclaim.includes("p")
    ) {
      const updatedPoints = points + 15;
      setClaims((prevClaims) => [
        ...prevClaims,
        "Pyramid Complete : 15 points",
      ]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "p"]);
      socket.emit("claimfromplayer", {
        data: "p",
        message: "pyramid",
        n: name,
        p: updatedPoints,
      });
    }
  };
  const sortedPlayers = [...playerData].sort((a, b) => b.points - a.points);
  const timeoutmsg = () => {
    setclick(1);
    setTimeout(() => {
      setclick(0);
    }, 5000);
  };

  const inbuildmsg = (e) => {
    if (click === 0) {
      setminput(e);
      socket.emit("sm", { message: e, n: name });
      setminput("");
      timeoutmsg();
    }
  };
  return (
    <div
      className={`${
        window.innerWidth >= 700 ? "w-[45%]" : "w-[95%]"
      } h-[screen] flex justify-center items-center flex-col`}
    >
      {/* type message component */}

      <div
        className={`${
          window.innerWidth >= 700 ? "w-[100%]" : "w-[100%]"
        } h-auto bg-zinc-500 rounded-md m-4`}
      >
        <input
          value={minput}
          maxLength={25}
          type="text"
          className="w-[82%] text-black h-[42px] p-2 rounded-tl-md font-semibold capitalize rounded-bl-md"
          placeholder="enter message"
          onChange={(e) => {
            setminput(e.target.value);
          }}
        />
        <button
          onClick={sendbt}
          className={`w-[18%] h-[40px] p-2 text-xs uppercase font-medium
            ${click == 1 ? "cursor-not-allowed blur-[2px]" : ""}
            `}
        >
          send
        </button>
      </div>

      {/* prebuild select msg component  */}

      <div
        style={{ width: "100%", overflowX: "auto", whiteSpace: "nowrap" }}
        className="flex p-2 bg-yellow-200 rounded-lg"
      >
        {[
          "hii😊",
          "nice game❤️",
          "im winner😎",
          "kya bolte maam😏",
          "im king👑",
          "women☕",
          "ego on top🙋‍♂️",
          "abusive🤬",
          "angry-man😡",
          "bored🥱",
          "luck=100🤞",
          "ha meri jaan🐽",
          "cancel BTS❌",
        ].map((e) => (
          <span
            onClick={() => {
              inbuildmsg(e);
            }}
            key={e}
            className={`
              ${
                click == 1
                  ? "cursor-not-allowed active:scale-[1] blur-[2px]"
                  : ""
              }
              ${click == 0 ? "cursor-pointer" : ""}
              p-1 m-1 bg-white active:scale-[0.9] border-black border-2 text-black rounded-md outline-none capitalize font-medium`}
          >
            {e}
          </span>
        ))}
      </div>
      <h2 className="text-red-700 font-bold uppercase text-base">
        there is a 5 sec timeout to send msg
      </h2>

      {/* number from server */}

      <div className="numbers w-full bg-zinc-700 pt-2 pb-2 mb-4 rounded-xl flex flex-row flex-nowrap overflow-x-scroll">
        {numbers.map((e, index) => (
          <p
            key={index}
            className={`${
              numbers.indexOf(e) === 0 ? "opacity-100" : "opacity-20"
            } bg-zinc-300 text-black inline-block pl-4 pr-4 p-3 m-1 rounded-full font-medium text-xl tracking-wider`}
          >
            {e}
          </p>
        ))}
      </div>

      {/* player / game /click */}

      <div
        className={`player-game w-full max-h-[450px] overflow-auto bg-yellow-100 ${
          window.innerWidth < 350 ? "p-1" : "p-2"
        }${window.innerWidth > 550 ? "p-4" : "p-2"} text-black rounded-xl`}
      >
        <div
          style={{
            width: "100%",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "inline-block",
              whiteSpace: "nowrap",
            }}
            className="font-medium mt-2 mb-2 ml-1 mr-1 pb-1"
          >
            {playerData.map((e, index) => (
              <p
                key={index}
                className="bg-white text-black p-2 capitalize inline-block rounded-lg ml-2"
              >
                {e.player} : {e.points}
              </p>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-9 gap-[2px]">
          {ticket.row1.map((number, index) => (
            <div
              onClick={() => handleCheck("l1", number)}
              key={`row1-${index}`}
              className={`elem elem-${number} ${
                window.innerWidth < 350 ? "p-[5px] text-sm" : "p-2"
              } text-center border select-none  border-gray-400 ${
                number ? "bg-zinc-100" : "bg-black"
              }`}
            >
              {number || ""}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-[2px] mt-[2px]">
          {ticket.row2.map((number, index) => (
            <div
              onClick={() => handleCheck("l2", number)}
              key={`row2-${index}`}
              className={`elem elem-${number} ${
                window.innerWidth < 350 ? "p-[5px] text-sm" : "p-2"
              } text-center border select-none focus:scale-95 border-gray-400 ${
                number ? "bg-zinc-100" : "bg-black"
              }`}
            >
              {number || ""}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-9 gap-[2px] mt-[2px]">
          {ticket.row3.map((number, index) => (
            <div
              onClick={() => handleCheck("l3", number)}
              key={`row3-${index}`}
              className={`elem elem-${number} ${
                window.innerWidth < 350 ? "p-[5px] text-sm" : "p-2"
              } text-center border select-none focus:scale-95 border-gray-400 ${
                number ? "bg-zinc-100" : "bg-black"
              }`}
            >
              {number || ""}
            </div>
          ))}
        </div>

        {/* claim menu pop up */}
        <div>
          <button
            onClick={() => {
              document.querySelector(".claimbox").style.display = "flex";
              document.querySelector(".claimbox").style.opacity = 1;
            }}
            className="pt-2 pb-2 pl-4 pr-4 uppercase m-2 bg-yellow-400 font-bold rounded-xl active:scale-[0.9]"
          >
            claim
          </button>
          <div
            style={{ display: "none" }}
            className={`claimbox
              ${window.innerWidth > 700 ? "scale-50" : "scale-100"}
              opacity-0 w-full min-h-fit flex pt-14 pb-4 pl-1 pr-1 bg-white fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex-wrap gap-4 justify-center items-center transition-all duration-500 ease-linear`}
          >
            <div
              onClick={() => {
                document.querySelector(".claimbox").style.opacity = 0;
                document.querySelector(".claimbox").style.display = "none";
              }}
              className="absolute right-2 top-2 cursor-pointer active:scale-[0.9]"
            >
              <IoMdClose className="text-3xl" />
            </div>
            <div
              onClick={e5click}
              className={`select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("e5")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={e5img}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                early five
              </p>
            </div>
            <div
              onClick={e7click}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("e7")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={e7img}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                early seven
              </p>
            </div>
            <div
              onClick={fclick}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("f")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={fimg}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                first line
              </p>
            </div>
            <div
              onClick={mclick}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("m")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={mimg}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                middle line
              </p>
            </div>
            <div
              onClick={lclick}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("l")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={limg}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                last line
              </p>
            </div>
            <div
              onClick={mnclick}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("mn")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={mnimg}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                middle no
              </p>
            </div>
            <div
              onClick={cclick}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("c")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={cimg}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                corner
              </p>
            </div>
            <div
              onClick={sclick}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("s")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={simg}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                star
              </p>
            </div>
            <div
              onClick={fullclick}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("full")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={fullimg}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                full house
              </p>
            </div>
            <div
              onClick={one43click}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("onefourthree")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={one43img}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                143
              </p>
            </div>
            <div
              onClick={pclick}
              className={` select-none border-2 active:scale-[0.9] border-black w-[25%] h-fit ${
                allclaim.includes("p")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={pimg}
                className="w-full h-[60%] bg-slate-500 object-contain"
                alt=""
              />
              <p className="text-[18px] w-fit text-center font-semibold capitalize rounded-lg">
                pyramid
              </p>
            </div>
          </div>
        </div>

        {/* {claims.length > 0 && (
          <div className="mt-4 bg-green-200 p-2 max-h-[100px] overflow-auto rounded flex flex-col-reverse">
            {claims.map((claim, index) => (
              <li key={index}>{claim}</li>
            ))}
          </div>
        )} */}
      </div>

      {/* message box */}

      <div
        className={`textpop ${message ? "block" : "hidden"} fixed flex ${
          window.innerWidth < 500
            ? "pt-1 pb-1 pl-2 pr-2 w-[450px] h-fit"
            : "pt-2 pb-2 pl-4 pr-4  w-fit h-fit"
        } font-bold capitalize rounded-2xl text-black justify-center items-center bg-orange-100/80 top-[10%] left-[50%] -translate-x-[50%] -translate-y-[50%] m-4 text-center`}
      >
        {message}
      </div>

      {allclaim.includes("full") ? (
        <div className="p-4 bg-gray-400 rounded-xl fixed min-h-[50vh]">
          <h1 className="text-2xl font-bold mb-4 text-center">Leaderboard</h1>
          <div className="pointtable border rounded-lg shadow-lg p-4 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Rank
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Player
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedPlayers.map((player, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? "bg-gray-50" : ""}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-black">
                      {index === 0 ||
                      sortedPlayers[index - 1].points !== player.points
                        ? index + 1
                        : ""}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-black">
                      {player.player}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="w-full h-[50px] flex justify-center items-center mt-4">
            <button className="p-2 pl-4 pr-4 bg-black m-2 uppercase font-medium rounded-full">
              <a href="https://tambolagame.onrender.com/host">create</a>
            </button>
            <button className="p-2 pl-4 pr-4 bg-black m-2 uppercase font-medium rounded-full">
              <a href="https://tambolagame.onrender.com/player">join</a>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default PlayerGame;
