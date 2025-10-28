import { GameState, Player as PlayerType, Tile } from '@word-mahjong/common';
import { Player } from './Player';
import { Deck } from './Deck';
import { v4 as uuidv4 } from 'uuid';

export class Game implements GameState {
  roomId: string;
  players: Record<string, Player> = {};
  wall: string[] = [];
  turn: string = '';
  turnExpiresAt: number = 0;
  gameState: 'waiting' | 'playing' | 'voting' | 'ended' = 'waiting';
  discards: Tile[] = [];
  melds = [];
  currentVote = null;

  constructor(roomId: string, customDeck?: string) {
    this.roomId = roomId;
    const deck = new Deck(customDeck);
    this.wall = deck.draw(deck.remaining); // Initially, the wall is the whole deck
  }

  addPlayer(player: Player) {
    this.players[player.id] = player;
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players[playerId];
  }

  removePlayer(playerId: string) {
    delete this.players[playerId];
  }

  startGame() {
    if (Object.keys(this.players).length !== 4) {
      throw new Error('Game must have 4 players to start.');
    }
    this.gameState = 'playing';
    this.dealInitialHands();
    this.nextTurn();
  }

  private dealInitialHands() {
    for (const playerId in this.players) {
      const tiles = this.drawTiles(13);
      this.players[playerId].hand = tiles;
    }
  }

  private drawTiles(count: number): Tile[] {
    const drawnStrings = this.wall.splice(0, count);
    return drawnStrings.map((text, i) => ({
      id: uuidv4(),
      text,
      x: i, // Initial position, client can change this
      y: 0,
    }));
  }

  private nextTurn() {
    const playerIds = Object.keys(this.players);
    const currentIndex = playerIds.indexOf(this.turn);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    this.turn = playerIds[nextIndex];
    this.turnExpiresAt = Date.now() + 20000; // 20 seconds per turn
  }

  public playTile(playerId: string, tileId: string) {
    if (this.turn !== playerId) {
      throw new Error('Not your turn.');
    }

    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found.');
    }

    const tileIndex = player.hand.findIndex(t => t.id === tileId);
    if (tileIndex === -1) {
      throw new Error('Tile not in hand.');
    }

    const [tile] = player.hand.splice(tileIndex, 1);
    this.discards.push(tile);

    this.nextTurn();
  }
}
