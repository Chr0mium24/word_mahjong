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
  private gameLoop: NodeJS.Timeout | null = null;
  private onUpdate: () => void;

  constructor(roomId: string, onUpdate: () => void, customDeck?: string) {
    this.roomId = roomId;
    this.onUpdate = onUpdate;
    const deck = new Deck(customDeck);
    this.wall = deck.draw(deck.remaining);
    this.startGameLoop();
  }

  addPlayer(player: Player) {
    this.players[player.id] = player;
    this.onUpdate();
  }

  getPlayer(playerId: string): Player | undefined {
    return this.players[playerId];
  }

  removePlayer(playerId: string) {
    delete this.players[playerId];
    this.onUpdate();
  }

  startGame() {
    if (Object.keys(this.players).length < 2) { // Let's allow 2 players for easier testing
      console.log('Game must have at least 2 players to start.');
      return;
    }
    this.gameState = 'playing';
    this.dealInitialHands();
    this.turn = Object.keys(this.players)[0];
    this.handleTurn();
  }

  private dealInitialHands() {
    for (const playerId in this.players) {
      const tiles = this.drawTiles(13);
      this.players[playerId].hand = tiles;
    }
  }

  private drawTiles(count: number): Tile[] {
    if (this.wall.length < count) {
      this.endGame('draw');
      return [];
    }
    const drawnStrings = this.wall.splice(0, count);
    return drawnStrings.map((text, i) => ({
      id: uuidv4(),
      text,
      x: i,
      y: 0,
    }));
  }

  private nextTurn() {
    const playerIds = Object.keys(this.players).filter(pId => this.players[pId].status !== 'disconnected');
    if (playerIds.length === 0) return;
    const currentIndex = playerIds.indexOf(this.turn);
    const nextIndex = (currentIndex + 1) % playerIds.length;
    this.turn = playerIds[nextIndex];
    this.handleTurn();
  }

  private handleTurn() {
    this.turnExpiresAt = Date.now() + 20000; // 20 seconds
    const currentPlayer = this.players[this.turn];
    if (!currentPlayer) return;

    const newTile = this.drawTiles(1)[0];
    if (newTile) {
      currentPlayer.hand.push(newTile);
    } else {
      return; // Game ended in drawTiles
    }
    
    this.onUpdate();
  }

  private checkTurnTimeout() {
    if (this.gameState !== 'playing') return;

    if (Date.now() > this.turnExpiresAt) {
      const currentPlayer = this.players[this.turn];
      if (currentPlayer && currentPlayer.hand.length > 0) {
        // Discard the last tile drawn
        const tileToDiscard = currentPlayer.hand[currentPlayer.hand.length - 1];
        console.log(`Player ${currentPlayer.name} timed out. Discarding ${tileToDiscard.text}`);
        this.playTile(this.turn, tileToDiscard.id, true);
      }
    }
  }
  
  private checkManagedPlayer() {
      if (this.gameState !== 'playing') return;
      const currentPlayer = this.players[this.turn];
      if (currentPlayer && currentPlayer.status === 'managed' && currentPlayer.hand.length > 0) {
          const tileToDiscard = currentPlayer.hand[currentPlayer.hand.length - 1];
          console.log(`Managed player ${currentPlayer.name} is playing. Discarding ${tileToDiscard.text}`);
          this.playTile(this.turn, tileToDiscard.id, true);
      }
  }

  public playTile(playerId: string, tileId: string, isAuto = false) {
    if (this.turn !== playerId && !isAuto) {
      throw new Error('Not your turn.');
    }

    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found.');
    }

    const tileIndex = player.hand.findIndex(t => t.id === tileId);
    if (tileIndex === -1) {
      // This can happen if a timeout/managed player discards a tile that was just drawn
      if(isAuto && player.hand.length > 0) {
          const [tile] = player.hand.splice(player.hand.length - 1, 1);
          this.discards.push(tile);
          this.nextTurn();
          return;
      }
      throw new Error('Tile not in hand.');
    }

    const [tile] = player.hand.splice(tileIndex, 1);
    this.discards.push(tile);

    this.nextTurn();
  }

  private startGameLoop() {
    this.gameLoop = setInterval(() => {
      this.checkTurnTimeout();
      this.checkManagedPlayer();
    }, 1000);
  }

  public endGame(reason: 'win' | 'draw', winnerId?: string) {
    this.gameState = 'ended';
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }

    if (reason === 'win' && winnerId) {
      const winner = this.players[winnerId];
      if (winner) {
        winner.score += 10;
        console.log(`Player ${winner.name} wins and gets 10 points.`);
      }
    }

    console.log(`Game ${this.roomId} ended. Reason: ${reason}.`);
    this.onUpdate();
  }

  public resetForNextGame() {
    this.gameState = 'waiting';
    const deck = new Deck(); // Assuming default deck for now
    this.wall = deck.draw(deck.remaining);
    this.discards = [];
    this.melds = [];
    this.turn = '';
    
    for(const playerId in this.players) {
        this.players[playerId].hand = [];
        this.players[playerId].penalty = 'none';
    }

    this.startGameLoop();
    console.log(`Game ${this.roomId} has been reset for the next round.`);
    // The startGame method should be called again when players are ready
  }
  
  // Call this when the game object is no longer needed
  public dispose() {
      if(this.gameLoop) {
          clearInterval(this.gameLoop);
      }
  }
}
