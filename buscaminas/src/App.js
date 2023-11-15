import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBomb, faFlag } from '@fortawesome/free-solid-svg-icons';
import React, { useState, useEffect, useRef } from 'react';
import AudioPlayer from 'react-audio-player';

const columnas = 12;
const filas = 20;

const ChessBoard = () => {
  const [musicaReproduciendo, setMusicaReproduciendo] = useState(false);
  const [pintarCeldas, setPintarCeldas] = useState(false);
  const urlMusica = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

  const cantidadBombas = (17 / 100) * filas * columnas;
  const [celdaAbierta, setCeldaAbierta] = useState(Array(filas * columnas).fill(false));
  const [banderaPuesta, setBanderaPuesta] = useState(Array(filas * columnas).fill(false));
  const [bombas, setBombas] = useState([]);
  const [posicionJugador, setPosicionJugador] = useState({ fila: 0, columna: 0 });
  const juegoIniciado = useRef(false);
  const juegoTerminado = useRef(false);

  useEffect(() => {
    if (!juegoIniciado.current) {
      const generarBombasAleatorias = () => {
        const posicionesAleatorias = [];
        while (posicionesAleatorias.length < cantidadBombas) {
          const filaAleatoria = Math.floor(Math.random() * filas);
          const columnaAleatoria = Math.floor(Math.random() * columnas);
          const posicion = `${filaAleatoria}-${columnaAleatoria}`;
          if (!posicionesAleatorias.includes(posicion)) {
            posicionesAleatorias.push(posicion);
          }
        }
        return posicionesAleatorias;
      };

      const bombasGeneradas = generarBombasAleatorias();

      const probabilidadUltimasCeldasAbiertas = Math.random();
      let numeroUltimasCeldasAbiertas = 0;

      if (probabilidadUltimasCeldasAbiertas <= 0.5) {
        numeroUltimasCeldasAbiertas = 6;
      } else if (probabilidadUltimasCeldasAbiertas <= 0.75) {
        numeroUltimasCeldasAbiertas = 7;
      } else {
        numeroUltimasCeldasAbiertas = 8;
      }

      const totalCeldas = filas * columnas;
      let celdasAbiertas = 0;

      setCeldaAbierta((prevCeldaAbierta) => {
        const nuevaCeldaAbierta = [...prevCeldaAbierta];
        for (let i = totalCeldas - 1; i >= 0; i--) {
          if (celdasAbiertas < numeroUltimasCeldasAbiertas) {
            const fila = Math.floor(i / columnas);
            const columna = i % columnas;
            if (!bombasGeneradas.includes(`${fila}-${columna}`)) {
              nuevaCeldaAbierta[i] = true;
              celdasAbiertas++;
            }
          }
        }
        return nuevaCeldaAbierta;
      });

      setBombas(bombasGeneradas);
      setPosicionJugador({ fila: filas - 1, columna: Math.floor(columnas / 2) }); // Posicionar al jugador en la última fila
      juegoIniciado.current = true;

      setTimeout(() => {
        setPintarCeldas(true);
      }, 10000); // Pinta las celdas después de 10 segundos
    }
  }, [cantidadBombas]);
  

  useEffect(() => {
    if (pintarCeldas && !juegoTerminado.current) {
      const intervalId = setInterval(() => {
        const ultimaFila = filas - 1;
        const ultimaColumna = columnas - 1;
        const nuevaCeldaAbierta = [...celdaAbierta];

        for (let columna = ultimaColumna; columna >= 0; columna--) {
          const indice = ultimaFila * columnas + columna;
          if (!nuevaCeldaAbierta[indice]) {
            nuevaCeldaAbierta[indice] = true;
            setCeldaAbierta([...nuevaCeldaAbierta]);
            break;
          }
        }

        const todasCeldasAbiertas = nuevaCeldaAbierta.every((celda) => celda === true);
        if (todasCeldasAbiertas) {
          clearInterval(intervalId);
        }
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [pintarCeldas, juegoTerminado, celdaAbierta, filas, columnas]);
  


useEffect(() => {
  const manejarPresionTecla = (evento) => {
    if (juegoTerminado.current) {
      return;
    }

    const { key } = evento;
    setPosicionJugador((prevPosicion) => {
      let newRow = prevPosicion.fila;
      let newCol = prevPosicion.columna;

      switch (key) {
        case 'ArrowUp':
          newRow = Math.max(0, newRow - 1);
          break;
        case 'ArrowDown':
          newRow = Math.min(filas - 1, newRow + 1);
          break;
        case 'ArrowLeft':
          newCol = Math.max(0, newCol - 1);
          break;
        case 'ArrowRight':
          newCol = Math.min(columnas - 1, newCol + 1);
          break;
        default:
          break;
      }
      
      if (bombas.includes(`${newRow}-${newCol}`)) {
        alert('¡Has perdido!');
        juegoTerminado.current = true;
        // Tratar la pérdida del juego aquí
      } else {
        return { fila: newRow, columna: newCol };
      }
    });
  };

  window.addEventListener('keydown', manejarPresionTecla);
  return () => {
    window.removeEventListener('keydown', manejarPresionTecla);
  };
}, [bombas, juegoTerminado]);
  
  const manejarClicCelda = (indice, clicDerecho) => {
    if (celdaAbierta[indice] || juegoTerminado.current) {
      return;
    }

    const nuevaBanderaPuesta = [...banderaPuesta];
    if (clicDerecho) {
      nuevaBanderaPuesta[indice] = !banderaPuesta[indice];
      setBanderaPuesta(nuevaBanderaPuesta);
    } else {
      if (nuevaBanderaPuesta[indice]) {
        nuevaBanderaPuesta[indice] = false;
        setBanderaPuesta(nuevaBanderaPuesta);
      } else {
        const nuevaCeldaAbierta = [...celdaAbierta];
        nuevaCeldaAbierta[indice] = true;
        setCeldaAbierta(nuevaCeldaAbierta);

        if (contarBombasAdyacentes(Math.floor(indice / columnas), indice % columnas) === 0) {
          const celdasPorAbrir = [{ fila: Math.floor(indice / columnas), columna: indice % columnas }];

          while (celdasPorAbrir.length > 0) {
            const { fila, columna } = celdasPorAbrir.pop();

            const direcciones = [
              [-1, -1], [-1, 0], [-1, 1],
              [0, -1], [0, 1],
              [1, -1], [1, 0], [1, 1]
            ];

            for (const [df, dc] of direcciones) {
              const nuevaFila = fila + df;
              const nuevaColumna = columna + dc;
              const nuevoIndice = nuevaFila * columnas + nuevaColumna;

              if (nuevaFila >= 0 && nuevaFila < filas && nuevaColumna >= 0 && nuevaColumna < columnas &&
                !nuevaCeldaAbierta[nuevoIndice] && !banderaPuesta[nuevoIndice]) {
                nuevaCeldaAbierta[nuevoIndice] = true;
                setCeldaAbierta(nuevaCeldaAbierta);

                if (contarBombasAdyacentes(nuevaFila, nuevaColumna) === 0) {
                  celdasPorAbrir.push({ fila: nuevaFila, columna: nuevaColumna });
                }
              }
            }
          }
        }
      }
    }
  };

  const manejarDobleClicCelda = (indice) => {
    if (!celdaAbierta[indice] || juegoTerminado.current) {
      return;
    }

    const bombasAdyacentes = contarBombasAdyacentes(Math.floor(indice / columnas), indice % columnas);
    const banderasAdyacentes = contarBanderasAdyacentes(Math.floor(indice / columnas), indice % columnas);

    if (bombasAdyacentes > 0 && bombasAdyacentes === banderasAdyacentes) {
      const nuevaCeldaAbierta = [...celdaAbierta];
      revelarCeldasAdyacentes(Math.floor(indice / columnas), indice % columnas, nuevaCeldaAbierta);
      setCeldaAbierta(nuevaCeldaAbierta);
    }
  };

  const contarBombasAdyacentes = (fila, columna) => {
    const direcciones = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    let contador = 0;

    for (const [df, dc] of direcciones) {
      const nuevaFila = fila + df;
      const nuevaColumna = columna + dc;
      if (nuevaFila >= 0 && nuevaFila < filas && nuevaColumna >= 0 && nuevaColumna < columnas) {
        if (bombas.includes(`${nuevaFila}-${nuevaColumna}`)) {
          contador++;
        }
      }
    }

    return contador;
  };

  const contarBanderasAdyacentes = (fila, columna) => {
    const direcciones = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];
    let contador = 0;

    for (const [df, dc] of direcciones) {
      const nuevaFila = fila + df;
      const nuevaColumna = columna + dc;
      if (nuevaFila >= 0 && nuevaFila < filas && nuevaColumna >= 0 && nuevaColumna < columnas) {
        if (banderaPuesta[nuevaFila * columnas + nuevaColumna]) {
          contador++;
        }
      }
    }

    return contador;
  };

  const revelarCeldasAdyacentes = (fila, columna, nuevaCeldaAbierta) => {
    const direcciones = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1], [0, 1],
      [1, -1], [1, 0], [1, 1]
    ];

    for (const [df, dc] of direcciones) {
      const nuevaFila = fila + df;
      const nuevaColumna = columna + dc;
      const nuevoIndice = nuevaFila * columnas + nuevaColumna;

      if (nuevaFila >= 0 && nuevaFila < filas && nuevaColumna >= 0 && nuevaColumna < columnas &&
        !nuevaCeldaAbierta[nuevoIndice] && !banderaPuesta[nuevoIndice]) {
        nuevaCeldaAbierta[nuevoIndice] = true;
        if (contarBombasAdyacentes(nuevaFila, nuevaColumna) === 0) {
          revelarCeldasAdyacentes(nuevaFila, nuevaColumna, nuevaCeldaAbierta);
        }
      }
    }
  };

  const celdas = [];
  for (let fila = 0; fila < filas; fila++) {
    for (let columna = 0; columna < columnas; columna++) {
      const indice = fila * columnas + columna;
      const celdaAbiertaActual = celdaAbierta[indice];
      const banderaPuestaActual = banderaPuesta[indice];
      const esPosicionJugador = posicionJugador.fila === fila && posicionJugador.columna === columna;
      const simbolo = bombas.includes(`${fila}-${columna}`) ? faBomb : '';
      const numero = contarBombasAdyacentes(fila, columna);
  
      const estiloCelda = {
        backgroundColor: celdaAbiertaActual ? '#e2e2e2' : '#bafbba',
        border: '2px solid black',
        position: 'relative',
      };
  
      if (esPosicionJugador) {
        estiloCelda.zIndex = 2;
      }
  
      celdas.push(
        <div
          key={`${fila}-${columna}`}
          className={`celda ${banderaPuestaActual ? 'bandera' : ''} ${esPosicionJugador ? 'jugador' : ''}`}
          style={estiloCelda}
          onClick={() => manejarClicCelda(indice, false)}
          onDoubleClick={() => manejarDobleClicCelda(indice)}
          onContextMenu={(evento) => {
            evento.preventDefault();
            manejarClicCelda(indice, true);
          }}
        >
          {/* Contenedor para el jugador */}
          {esPosicionJugador && (
            <div className="jugador-container" style={{ position: 'absolute', top: 0, left: 0 }}>
              {/* Puedes personalizar la apariencia del jugador aquí */}
              <span role="img" aria-label="jugador">👤</span>
            </div>
          )}
  
          <span>
            {banderaPuestaActual ? (
              <FontAwesomeIcon icon={faFlag} />
            ) : celdaAbiertaActual ? (
              simbolo !== '' ? (
                <FontAwesomeIcon icon={simbolo} />
              ) : numero > 0 ? (
                numero
              ) : (
                ''
              )
            ) : (
              ' '
            )}
          </span>
        </div>
      );
    }
  }

return (
  <div>
  {/* Reproductor de audio */}
  <AudioPlayer
    src={urlMusica}
    autoPlay={musicaReproduciendo}
    controls
    style={{ display: 'none' }}
  />

     {/* Botón para reproducir/detener música */}
     <button onClick={() => setMusicaReproduciendo(!musicaReproduciendo)}>
      {musicaReproduciendo ? 'Detener Música' : 'Reproducir Música'}
    </button>

    {/* Tablero de ajedrez */}
    <div className="tablero-ajedrez" style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${columnas}, 50px)`,
      gridTemplateRows: `repeat(${filas}, 50px)`
    }}>
       {celdas}
    </div>
  </div>
);
        }

export default ChessBoard;