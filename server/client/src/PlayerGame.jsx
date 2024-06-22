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
    { start: 1, end: 10 },
    { start: 11, end: 20 },
    { start: 21, end: 30 },
    { start: 31, end: 40 },
    { start: 41, end: 50 },
    { start: 51, end: 60 },
    { start: 61, end: 70 },
    { start: 71, end: 80 },
    { start: 81, end: 90 },
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

  // const [allclaim, setAllClaim] = useState([]);

  useEffect(() => {
    setLine1(ticket.row1.filter((n) => n).sort((a, b) => a - b));
    setLine2(ticket.row2.filter((n) => n).sort((a, b) => a - b));
    setLine3(ticket.row3.filter((n) => n).sort((a, b) => a - b));
  }, [ticket]);

  //player name from socket
  // useEffect(() => {
  //   socket.on("room-joined", (data) => {
  //     setName(data.name);
  //     console.log(name);
  //   });

  //   return () => {
  //     socket.off("room-joined");
  //   };
  // }, []);

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
      socket.emit("claimfromplayer", { data: "f", n: name, p: updatedPoints });
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
      socket.emit("claimfromplayer", { data: "m", n: name, p: updatedPoints });
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
      socket.emit("claimfromplayer", { data: "l", n: name, p: updatedPoints });
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
      socket.emit("claimfromplayer", { data: "e5", n: name, p: updatedPoints });
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
      socket.emit("claimfromplayer", { data: "e7", n: name, p: updatedPoints });
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
      socket.emit("claimfromplayer", { data: "c", n: name, p: updatedPoints });
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
      socket.emit("claimfromplayer", { data: "s", n: name, p: updatedPoints });
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
      socket.emit("claimfromplayer", { data: "mn", n: name, p: updatedPoints });
    }
  };

  const fullclick = () => {
    const { l1, l2, l3 } = check;
    if (
      l1.length + l2.length + l3.length ===
        line1.length + line2.length + line3.length &&
      !claims.includes("Full House Complete : 50 points") &&
      !allclaim.includes("full")
    ) {
      const updatedPoints = points + 50;
      setClaims((prevClaims) => [
        ...prevClaims,
        "Full House Complete : 50 points",
      ]);
      setAllClaim((prevAllClaim) => [...prevAllClaim, "full"]);
      socket.emit("claimfromplayer", {
        data: "full",
        n: name,
        p: updatedPoints,
      });
    }
  };

  return (
    <>
      <div
        className={`${
          window.innerWidth >= 700 ? "w-[45%]" : "w-[90%]"
        } h-[screen]`}
      >
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
        <div className="player-game max-h-[450px] overflow-auto bg-zinc-700 p-4 text-black rounded-xl">
          <h2 className="font-medium mb-4 flex overflow-auto items-center pb-4">
            {playerData.map((e) => (
              <p className="bg-white text-black p-2 capitalize rounded-lg ml-2">
                {e.player} : {e.points}
              </p>
            ))}
          </h2>
          <div className="grid grid-cols-9 gap-1">
            {ticket.row1.map((number, index) => (
              <div
                onClick={() => handleCheck("l1", number)}
                key={`row1-${index}`}
                className={`elem elem-${number} ${
                  window.innerWidth < 400 ? "p-1 text-xs" : "p-2"
                } text-center border border-gray-400 ${
                  number ? "bg-zinc-100" : "bg-black"
                }`}
              >
                {number || ""}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-9 gap-1 mt-1">
            {ticket.row2.map((number, index) => (
              <div
                onClick={() => handleCheck("l2", number)}
                key={`row2-${index}`}
                className={`elem elem-${number} ${
                  window.innerWidth < 400 ? "p-1 text-xs" : "p-2"
                } text-center border border-gray-400 ${
                  number ? "bg-zinc-100" : "bg-black"
                }`}
              >
                {number || ""}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-9 gap-1 mt-1">
            {ticket.row3.map((number, index) => (
              <div
                onClick={() => handleCheck("l3", number)}
                key={`row3-${index}`}
                className={`elem elem-${number} ${
                  window.innerWidth < 400 ? "p-1 text-xs" : "p-2"
                } text-center border border-gray-400 ${
                  number ? "bg-zinc-100" : "bg-black"
                }`}
              >
                {number || ""}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap pt-4 gap-4 justify-center items-center">
            <div
              onClick={e5click}
              className={`w-[100px] h-[55px] ${
                window.innerWidth <= 400 ? "w-[30vw]" : ""
              } border-2 border-black cursor-pointer ${
                allclaim.includes("e5")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={e5img}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={e7click}
              className={`w-[100px] h-[55px] border-2 border-black cursor-pointer${
                allclaim.includes("e7")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : ""
              }`}
            >
              <img
                src={e7img}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={fclick}
              className={`w-[100px] h-[55px] border-2 border-black cursor-pointer ${
                allclaim.includes("f")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={fimg}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={mclick}
              className={`w-[100px] h-[55px] border-2 border-black cursor-pointer ${
                allclaim.includes("m")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={mimg}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={lclick}
              className={`w-[100px] h-[55px] border-2 border-black cursor-pointer ${
                allclaim.includes("l")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={limg}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={mnclick}
              className={`w-[100px] h-[55px] border-2 border-black cursor-pointer
                ${
                  allclaim.includes("mn")
                    ? "cursor-not-allowed brightness-50 blur-[4px]"
                    : "cursor-pointer brightness-100 blur-[0px]"
                }
                `}
            >
              <img
                src={mnimg}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={cclick}
              className={`w-[100px] h-[55px] border-2 border-black cursor-pointer ${
                allclaim.includes("c")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={cimg}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={sclick}
              className={`w-[100px] h-[55px] border-2 border-black cursor-pointer ${
                allclaim.includes("s")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={simg}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              onClick={fullclick}
              className={`w-[100px] h-[55px] border-2 border-black cursor-pointer ${
                allclaim.includes("full")
                  ? "cursor-not-allowed brightness-50 blur-[4px]"
                  : "cursor-pointer brightness-100 blur-[0px]"
              }`}
            >
              <img
                src={fullimg}
                alt="image"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          {claims.length > 0 && (
            <div className="mt-4 bg-green-200 p-2 max-h-[100px] overflow-auto rounded flex flex-col-reverse">
              <h3 className="text-lg font-bold">Claims:</h3>

              {claims.map((claim, index) => (
                <li key={index}>{claim}</li>
              ))}
            </div>
          )}
        </div>

        {/* <div
        className={`${
          window.innerWidth >= 700 ? "w-[680px]" : "w-[520px]"
        } h-[screen] w-full h-auto fixed top-[5%] bg-zinc-700 rounded-md left-[50%] -translate-x-[50%] -translate-y-[50%]`}
      >
        <input
          type="text"
          className="w-[90%]  h-[40px] p-2 rounded-tl-md font-semibold capitalize rounded-bl-md"
          placeholder="enter message"
        />
        <button className="w-[10%] h-[40px] p-2 text-sm uppercase font-medium">
          send
        </button>
      </div> */}

        {/* <div className="w-[500px] h-[50px] bg-white">ekjd</div> */}
      </div>
    </>
  );
};

export default PlayerGame;
