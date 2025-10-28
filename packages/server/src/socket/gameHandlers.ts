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

  socket.on('startGame', startGame);
  socket.on('playTile', playTile);
}
