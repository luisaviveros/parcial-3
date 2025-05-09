import { navigateTo, socket } from "../app.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="screen1">
      <h2>Jugadores en el Juego</h2>
      <div id="players-list"></div>
      <button id="sort-alphabetically">Ordenar alfabéticamente</button> <!-- Mostrar el botón -->
      <button id="reset-scores">Reiniciar el juego</button>
    </div>
  `;

  // Escuchar los cambios en las puntuaciones de los jugadores
  socket.on("update-scores", (players) => {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = ""; // Limpiar la lista existente

    players.forEach((player) => {
      const playerDiv = document.createElement("div");
      playerDiv.textContent = `${player.nickname}: ${player.score} pts`;
      playersList.appendChild(playerDiv);
    });
  });

  // Escuchar la notificación de que un jugador ha ganado
  socket.on("final-results", (data) => {
    navigateTo("/screen2", { players: data.players, winner: data.winner });
  });

  // Evento para ordenar jugadores alfabéticamente
  document.getElementById("sort-alphabetically").addEventListener("click", () => {
    console.log("Ordenando jugadores alfabéticamente...");
    // Emitir al backend para que ordene a los jugadores alfabéticamente
    socket.emit("sortPlayersAlphabetically");
  });

  // Escuchar la respuesta del servidor cuando los jugadores se ordenen
  socket.on("sorted-players", (sortedPlayers) => {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = "";  // Limpiar la lista existente
    sortedPlayers.forEach((player) => {
      const playerDiv = document.createElement("div");
      playerDiv.textContent = `${player.nickname}: ${player.score} pts`;
      playersList.appendChild(playerDiv);
    });
  });

  // Evento para reiniciar el juego
  document.getElementById("reset-scores").addEventListener("click", () => {
    console.log("Reiniciando el juego...");
    socket.emit("reset-scores");  // Emitir al backend para reiniciar el juego
  });
}
