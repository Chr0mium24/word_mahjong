const Player = require('./Player');
const Deck = require('./Deck');

class Game {
  constructor(roomId, customDeck = '') {
    this.roomId = roomId;
    this.players = {};
    this.wall = new Deck(customDeck);
    this.turn = null;
    this.turnExpiresAt = null;
    this.gameState = 'waiting'; // 'waiting', 'playing', 'voting', 'ended'
    this.discards = [];
    this.melds = {};
    this.currentVote = null;
  }

  addPlayer(id, username) {
    if (Object.keys(this.players).length >= 4) {
      throw new Error('Room is full');
    }
    const player = new Player(id, username);
    this.players[id] = player;
    return player;
  }

  removePlayer(id) {
    delete this.players[id];
  }

  getPlayer(id) {
    return this.players[id];
  }

  // More methods to come for game logic: startGame, playTile, claimAction, etc.
}

module.exports = Game;
