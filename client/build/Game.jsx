import React, { useState } from "react";

const generateTambolaTicket = () => {
  const ticket = Array.from({ length: 3 }, () => Array(9).fill(null));
  const columnRanges = [
    [1, 9],
    [10, 19],
    [20, 29],
    [30, 39],
    [40, 49],
    [50, 59],
    [60, 69],
    [70, 79],
    [80, 90],
  ];
  const numbersSet = new Set();

  for (let col = 0; col < 9; col++) {
    const [min, max] = columnRanges[col];
    const numbers = [];

    while (numbers.length < 3) {
      const num = Math.floor(Math.random() * (max - min + 1)) + min;
      if (!numbersSet.has(num)) {
        numbers.push(num);
        numbersSet.add(num);
      }
    }

    numbers.sort((a, b) => a - b);

    // Decide the rows to place the numbers (randomly choose up to 3 positions in this column)
    const rowIndices = [0, 1, 2];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * rowIndices.length);
      rowIndices.splice(randomIndex, 1);
    }

    rowIndices.forEach((rowIndex, i) => {
      ticket[rowIndex][col] = numbers[i];
    });
  }

  // Ensure each row has exactly 5 numbers
  for (let row = 0; row < 3; row++) {
    let count = 0;
    for (let col = 0; col < 9; col++) {
      if (ticket[row][col] !== null) count++;
    }

    while (count < 5) {
      const col = Math.floor(Math.random() * 9);
      if (ticket[row][col] === null) {
        const [min, max] = columnRanges[col];
        let num;
        do {
          num = Math.floor(Math.random() * (max - min + 1)) + min;
        } while (numbersSet.has(num));

        ticket[row][col] = num;
        numbersSet.add(num);
        count++;
      }
    }
  }

  return ticket;
};

const Ticket = ({ ticket }) => (
  <div className="w-full max-w-2xl mx-auto mt-8">
    <div className="grid grid-cols-9 gap-2">
      {ticket.map((row, rowIndex) =>
        row.map((num, colIndex) => (
          <div
            key={`${rowIndex}-${colIndex}`}
            className={`flex items-center justify-center border border-gray-400 p-2 aspect-square ${
              num ? "bg-blue-200" : "bg-white"
            }`}
          >
            {num}
          </div>
        ))
      )}
    </div>
  </div>
);

function Game() {
  const [ticket, setTicket] = useState(generateTambolaTicket);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Tambola Ticket Generator</h1>
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded mb-4"
        onClick={() => setTicket(generateTambolaTicket)}
      >
        Generate New Ticket
      </button>
      <Ticket ticket={ticket} />
    </div>
  );
}

export default Game;
