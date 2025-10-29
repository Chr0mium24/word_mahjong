import { Server, Socket } from 'socket.io';
import { Game } from '../game/Game';
import { PlayTilePayload } from '@word-mahjong/common';

// This is a simplified way to access the games object.
// In a real-world scenario, you might use a more robust state management solution.
import { games } from './roomHandlers'; 

export function registerGameHandlers(io: Server, socket: Socket) {
  const startGame = ({ roomId }: { roomId: string }) => {
    const game = games[roomId];
    if (game) {
      try {
        game.startGame();
        io.to(roomId).emit('gameStateUpdate', game);
      } catch (error) {
        socket.emit('gameError', { message: error.message });
      }
    }
  };

  const playTile = ({ tileId }: PlayTilePayload) => {
    // Find the game this player is in
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId) return;

    const game = games[roomId];
    if (game) {
      try {
        game.playTile(socket.id, tileId);
        io.to(roomId).emit('gameStateUpdate', game);
      } catch (error) {
        socket.emit('gameError', { message: error.message });
      }
    }
  };

  const readyForNextGame = () => {
    const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
    if (!roomId) return;

    const game = games[roomId as string];
    if (game) {
      const player = game.getPlayer(socket.id);
      if (player) {
        player.isReady = true;
      }

      const allPlayersReady = Object.values(game.players).every(p => p.isReady);

      if (allPlayersReady) {
        game.resetForNextGame();
        // Reset ready status for all players
        for (const p of Object.values(game.players)) {
          p.isReady = false;
        }
        game.startGame();
      }
    }
  };

  socket.on('startGame', startGame);
  socket.on('playTile', playTile);
  socket.on('readyForNextGame', readyForNextGame);
}
