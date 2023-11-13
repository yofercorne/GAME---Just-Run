import './App.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faFlag } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect, useRef } from 'react';

const columna = 5;
const fila = 5;

const ChessBoard = () => {
  const cantidad_bombs = (17 / 100) * fila * columna;

  const [isCellOpen, setIsCellOpen] = useState(Array(fila * columna).fill(false));
  const [isFlagged, setIsFlagged] = useState(Array(fila * columna).fill(false));
  const [bombas, setBombas] = useState([]);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      const generateRandombombas = () => {
        const randomPositions = [];
        while (randomPositions.length < cantidad_bombs) {
          const randomRow = Math.floor(Math.random() * fila);
          const randomCol = Math.floor(Math.random() * columna);
          const position = `${randomRow}-${randomCol}`;
          if (!randomPositions.includes(position)) {
            randomPositions.push(position);
          }
        }
        return randomPositions;
      };

      const generatedBombas = generateRandombombas();

      // Calcular la probabilidad de casillas abiertas
      const openLastSquaresProbability = Math.random();
      let numberOfOpenLastSquares = 0;

      if (openLastSquaresProbability <= 0.5) {
        numberOfOpenLastSquares = 6;
      } else if (openLastSquaresProbability <= 0.75) {
        numberOfOpenLastSquares = 7;
      } else {
        numberOfOpenLastSquares = 8;
      }

      // Marcar las últimas casillas como abiertas sin bombas
      const totalSquares = fila * columna;
      let openSquares = 0;

      setIsCellOpen((prevIsCellOpen) => {
        const newIsCellOpen = [...prevIsCellOpen];
        for (let i = totalSquares - 1; i >= 0; i--) {
          if (openSquares < numberOfOpenLastSquares) {
            const row = Math.floor(i / columna);
            const col = i % columna;
            if (!generatedBombas.includes(`${row}-${col}`)) {
              newIsCellOpen[i] = true;
              openSquares++;
            }
          }
        }
        return newIsCellOpen;
      });

      setBombas(generatedBombas);
      hasInitialized.current = true;
    }
  }, [cantidad_bombs]);

  const handleCellClick = (index, isRightClick) => {
    if (isCellOpen[index]) {
      return;
    }

    const newIsFlagged = [...isFlagged];
    if (isRightClick) {
      newIsFlagged[index] = !isFlagged[index];
      setIsFlagged(newIsFlagged); // Actualiza el estado de las banderas.
    } else {
      if (newIsFlagged[index]) {
        // Si ya hay una bandera en la celda, quitarla
        newIsFlagged[index] = false;
        setIsFlagged(newIsFlagged); // Actualiza el estado de las banderas.
      } else {
        // Si no hay bandera, abrir la celda
        const newIsCellOpen = [...isCellOpen];
        newIsCellOpen[index] = true;
        setIsCellOpen(newIsCellOpen); // Actualiza el estado de las celdas abiertas.

        if (countAdjacentBombs(Math.floor(index / columna), index % columna) === 0) {
          const cellsToOpen = [{ row: Math.floor(index / columna), col: index % columna }];

          while (cellsToOpen.length > 0) {
            const { row, col } = cellsToOpen.pop();

            const directions = [
              [-1, -1], [-1, 0], [-1, 1],
              [0, -1], [0, 1],
              [1, -1], [1, 0], [1, 1]
            ];

            for (const [dr, dc] of directions) {
              const newRow = row + dr;
              const newCol = col + dc;
              const newIndex = newRow * columna + newCol;

              if (newRow >= 0 && newRow < fila && newCol >= 0 && newCol < columna && !newIsCellOpen[newIndex] && !isFlagged[newIndex]) {
                newIsCellOpen[newIndex] = true;
                setIsCellOpen(newIsCellOpen); // Actualiza el estado de las celdas abiertas.

                if (countAdjacentBombs(newRow, newCol) === 0) {
                  cellsToOpen.push({ row: newRow, col: newCol });
                }
              }
            }
          }
        }
      }
    }
  };

  const handleDoubleCellClick = (index) => {
    if (!isCellOpen[index]) {
      return;
    }

    const adjacentBombs = countAdjacentBombs(Math.floor(index / columna), index % columna);
    const adjacentFlags = countAdjacentFlags(Math.floor(index / columna), index % columna);

    if (adjacentBombs > 0 && adjacentBombs === adjacentFlags) {
      // Caso de doble clic válido, revelar casillas adyacentes
      const newIsCellOpen = [...isCellOpen];
      revealAdjacentCells(Math.floor(index / columna), index % columna, newIsCellOpen);
      setIsCellOpen(newIsCellOpen);
    }
  };

  const countAdjacentBombs = (row, col) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    let count = 0;

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < fila && newCol >= 0 && newCol < columna) {
        if (bombas.includes(`${newRow}-${newCol}`)) {
          count++;
        }
      }
    }

    return count;
  };

  const countAdjacentFlags = (row, col) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    let count = 0;

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      if (newRow >= 0 && newRow < fila && newCol >= 0 && newCol < columna) {
        if (isFlagged[newRow * columna + newCol]) {
          count++;
        }
      }
    }

    return count;
  };

  const revealAdjacentCells = (row, col, newIsCellOpen) => {
    const directions = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (const [dr, dc] of directions) {
      const newRow = row + dr;
      const newCol = col + dc;
      const newIndex = newRow * columna + newCol;

      if (newRow >= 0 && newRow < fila && newCol >= 0 && newCol < columna && !newIsCellOpen[newIndex] && !isFlagged[newIndex]) {
        newIsCellOpen[newIndex] = true;
        if (countAdjacentBombs(newRow, newCol) === 0) {
          revealAdjacentCells(newRow, newCol, newIsCellOpen);
        }
      }
    }
  };

  const squares = [];

  for (let row = 0; row < fila; row++) {
    for (let col = 0; col < columna; col++) {
      const index = row * columna + col;
      const isCellOpened = isCellOpen[index];
      const isCellFlagged = isFlagged[index];
      const symbol = bombas.includes(`${row}-${col}`) ? faBomb : '';
      const number = countAdjacentBombs(row, col);

      squares.push(
        <div
          key={`${row}-${col}`}
          className={`square ${isCellFlagged ? 'flagged' : ''}`}
          style={{
            backgroundColor: isCellOpened ? '#e2e2e2' : '#bafbba',
            border: '2px solid black',
          }}
          onClick={() => handleCellClick(index, false)}
          onDoubleClick={() => handleDoubleCellClick(index)}
          onContextMenu={(event) => {
            event.preventDefault();
            handleCellClick(index, true);
          }}
        >
          <span>
            {isCellFlagged ? (
              <FontAwesomeIcon icon={faFlag} />
            ) : isCellOpened ? (
              symbol !== '' ? (
                <FontAwesomeIcon icon={symbol} />
              ) : number > 0 ? (
                number
              ) : (
                ''
              )
            ) : 
              ' '
            }
          </span>
        </div>
      );
    }
  }

  return (
    <div className="chess-board" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columna}, 50px)`,
      gridTemplateRows: `repeat(${fila}, 50px)`
    }}>
      {squares}
    </div>
  );
};

export default ChessBoard;
