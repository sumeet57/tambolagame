function generateTambolaTicket() {
  const ticket = Array.from({ length: 3 }, () => Array(9).fill(0));
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

    const rowIndices = [0, 1, 2];
    for (let i = 0; i < 2; i++) {
      const randomIndex = Math.floor(Math.random() * rowIndices.length);
      rowIndices.splice(randomIndex, 1);
    }

    rowIndices.forEach((rowIndex, i) => {
      ticket[rowIndex][col] = numbers[i];
    });
  }

  for (let row = 0; row < 3; row++) {
    const columnsToFill = [];

    for (let col = 0; col < 9; col++) {
      if (ticket[row][col] === 0) {
        columnsToFill.push(col);
      }
    }

    while (columnsToFill.length > 4) {
      const randomIndex = Math.floor(randomIndex * columnsToFill.length);
      columnsToFill.splice(randomIndex, 1);
    }

    columnsToFill.forEach((col) => {
      const [min, max] = columnRanges[col];
      let num;
      do {
        num = Math.floor(Math.random() * (max - min + 1)) + min;
      } while (numbersSet.has(num));

      ticket[row][col] = num;
      numbersSet.add(num);
    });
  }

  return ticket;
}

export default generateTambolaTicket;
