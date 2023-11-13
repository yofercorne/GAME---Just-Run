import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSquare } from '@fortawesome/free-solid-svg-icons';

export function createMaze(rows, cols) {
  const maze = [];

  // Inicializa el laberinto con paredes y caminos
  for (let i = 0; i < rows; i++) {
    maze[i] = Array(cols).fill(null);
  }

  // Define los caracteres para entrada y salida
  maze[0][0] = 'E '; // Entrada
  maze[rows - 1][cols - 1] = 'X '; // Salida

  // Genera el laberinto (puedes implementar aquí tu algoritmo de generación)
  generateMaze(maze, 0, 0, rows - 1, cols - 1);

  return maze;
}

// Función para generar el laberinto (ejemplo de algoritmo recursivo)
function generateMaze(maze, x, y, targetX, targetY) {
  if (x === targetX && y === targetY) {
    return;
  }

  const directions = shuffleDirections(); // Función para mezclar las direcciones
  for (const dir of directions) {
    const newX = x + dir[0];
    const newY = y + dir[1];

    if (newX >= 0 && newX < maze.length && newY >= 0 && newY < maze[0].length && maze[newX][newY] === null) {
      maze[newX][newY] = '  '; // Marca el camino
      generateMaze(maze, newX, newY, targetX, targetY);
    }
  }
}

// Función para mezclar las direcciones
function shuffleDirections() {
  const directions = [[2, 0], [-2, 0], [0, 2], [0, -2]]; // Usamos 2 espacios para crear líneas visibles
  for (let i = directions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [directions[i], directions[j]] = [directions[j], directions[i]];
  }
  return directions;
}

function renderMaze(maze) {
  return maze.map((row, rowIndex) => (
    <div key={rowIndex} className="maze-row">
      {row.map((cell, colIndex) => (
        <span key={colIndex} className="maze-cell">
          {cell === null ? <FontAwesomeIcon icon={faSquare} /> : cell}
        </span>
      ))}
    </div>
  ));
}

function App() {
  const rows = 10;
  const cols = 10;
  const maze = createMaze(rows, cols);

  return (
    <div className="board">
      {renderMaze(maze)}
    </div>
  );
}

export default App;
