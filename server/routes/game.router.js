const express = require('express');
const gameController = require('../controllers/game.controller');
const router = express.Router();

// Rutas para las operaciones del juego
router.post("/join", gameController.joinGame);
router.post("/start", gameController.startGame);
router.post("/marco", gameController.notifyMarco);
router.post("/polo", gameController.notifyPolo);
router.post("/select-polo", gameController.selectPolo);
router.post("/reset", gameController.resetGame); 


module.exports = router;
