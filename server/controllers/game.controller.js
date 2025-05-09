const playersDb = require("../db/players.db");
const {
  emitEvent,
  emitToSpecificClient,
} = require("../services/socket.service");

const joinGame = async (req, res) => {
  try {
    const { nickname, socketId } = req.body;
    playersDb.addPlayer(nickname, socketId);

    const gameData = playersDb.getGameData();
    emitEvent("userJoined", gameData);

    res.status(200).json({ success: true, players: gameData.players });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startGame = async (req, res) => {
  try {
    const playersWithRoles = playersDb.assignPlayerRoles();

    playersWithRoles.forEach((player) => {
      emitToSpecificClient(player.id, "startGame", player.role);
    });

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Función para actualizar las puntuaciones de los jugadores
const updateScore = async (playerId, points) => {
  const player = playersDb.findPlayerById(playerId);
  if (player) {
    player.score += points;
    
    // Emitir evento para actualizar las puntuaciones
    const gameData = playersDb.getGameData(); // Obtener todos los jugadores y sus puntuaciones
    emitEvent("update-scores", gameData.players);
    
    // Verificar si algún jugador ha ganado
    if (player.score >= 100) {
      emitEvent("final-results", {
        winner: player,
        players: gameData.players
      });
    }
  }
};

// Función para manejar el evento cuando un jugador sea "Marco" y atrape un "Polo especial"
const notifyMarco = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole([
      "polo",
      "polo-especial",
    ]);

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Marco!!!",
        userId: socketId,
      });
    });

    // Actualizar la puntuación de "Marco" por capturar un "Polo especial"
    await updateScore(socketId, 50); // Ejemplo de añadir 50 puntos a "Marco"

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Función para manejar el evento cuando un jugador sea "Polo" y sea atrapado por "Marco"
const notifyPolo = async (req, res) => {
  try {
    const { socketId } = req.body;

    const rolesToNotify = playersDb.findPlayersByRole("marco");

    rolesToNotify.forEach((player) => {
      emitToSpecificClient(player.id, "notification", {
        message: "Polo!!",
        userId: socketId,
      });
    });

    // Actualizar la puntuación de "Polo"
    await updateScore(socketId, 10); // Ejemplo de añadir 10 puntos a "Polo"
    
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Función para manejar la selección de un "Polo"
const selectPolo = async (req, res) => {
  try {
    const { socketId, poloId } = req.body;

    const myUser = playersDb.findPlayerById(socketId);
    const poloSelected = playersDb.findPlayerById(poloId);
    const allPlayers = playersDb.getAllPlayers();

    if (poloSelected.role === "polo-especial") {
      // Notificar que el juego ha terminado
      allPlayers.forEach((player) => {
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} ha ganado, ${poloSelected.nickname} ha sido capturado`,
        });
      });
    } else {
      // Si el "Polo" no es especial, el "Marco" pierde
      allPlayers.forEach((player) => {
        emitToSpecificClient(player.id, "notifyGameOver", {
          message: `El marco ${myUser.nickname} ha perdido`,
        });
      });
    }

    // Actualizar puntuaciones de ambos jugadores
    await updateScore(socketId, -10); // Ejemplo de restar 10 puntos a "Marco"
    await updateScore(poloId, -10); // Ejemplo de restar 10 puntos a "Polo"

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Función para reiniciar el juego
const resetGame = async (req, res) => {
  try {
    playersDb.resetGame(); // Limpiar las puntuaciones y los jugadores
    emitEvent("update-scores", playersDb.getGameData().players); // Emitir las puntuaciones iniciales (vacías)
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Función para manejar la ordenación de jugadores alfabéticamente
const sortPlayersAlphabetically = async (req, res) => {
  try {
    const gameData = playersDb.getGameData();
    const sortedPlayers = gameData.players.sort((a, b) => {
      return a.nickname.localeCompare(b.nickname);  // Ordena alfabéticamente por nombre
    });

    // Emitir evento con los jugadores ordenados alfabéticamente
    emitEvent("sorted-players", sortedPlayers);  // Asegúrate de que este evento se emita correctamente

    res.status(200).json({ success: true, players: sortedPlayers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  joinGame,
  startGame,
  notifyMarco,
  notifyPolo,
  selectPolo,
  resetGame,
  sortPlayersAlphabetically,  
};


