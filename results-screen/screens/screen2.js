import { navigateTo, socket } from "../app.js";

export default function renderScreen2(data) {
  const app = document.getElementById("app");

  // Asegúrate de que los jugadores estén correctamente renderizados en el HTML
  app.innerHTML = `
    <div id="screen2">
      <h2>¡El ganador es ${data.winner.nickname}!</h2>
      <h3>Resultados Finales</h3>
      <div id="players-list"></div>
      <button id="sort-alphabetically">Ordenar alfabéticamente</button> <!-- Mostrar el botón -->
      <button id="reset-scores">Reiniciar el juego</button>
    </div>
  `;

  // Mostrar los jugadores y sus puntuaciones
  const playersList = document.getElementById("players-list");
  data.players.forEach((player) => {
    const playerDiv = document.createElement("div");
    playerDiv.textContent = `${player.nickname}: ${player.score} pts`;
    playersList.appendChild(playerDiv);
  });

  
  const sortButton = document.getElementById("sort-alphabetically");
  if (sortButton) {
    sortButton.style.display = "block";  // Asegura que el botón esté visible
  }

  // Evento para ordenar jugadores alfabéticamente
  sortButton.addEventListener("click", () => {
    console.log("Ordenando jugadores alfabéticamente...");
    // Emitir al backend para que ordene a los jugadores alfabéticamente
    socket.emit("sortPlayersAlphabetically");
  });

  // Escuchar la respuesta del servidor cuando los jugadores se ordenen
  socket.on("sorted-players", (sortedPlayers) => {
    updatePlayerList(sortedPlayers);
  });

  // Reiniciar el juego
  document.getElementById("reset-scores").addEventListener("click", () => {
    socket.emit("reset-scores");
    navigateTo("/");
  });

  // Función para actualizar la lista de jugadores en la UI
  function updatePlayerList(players) {
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = "";  // Limpiar la lista existente
    players.forEach((player) => {
      const playerDiv = document.createElement("div");
      playerDiv.textContent = `${player.nickname}: ${player.score} pts`;
      playersList.appendChild(playerDiv);
    });
  }
}
