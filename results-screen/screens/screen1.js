import { navigateTo, socket } from "../app.js";

export default function renderScreen1() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div id="screen1">
      <h2>Jugadores en el Juego</h2>
      <div id="players-list"></div>
      
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
}
