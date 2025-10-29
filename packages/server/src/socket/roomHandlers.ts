import { Server, Socket } from 'socket.io';
import { Game } from '../game/Game';
import { Player } from '../game/Player';
import { CreateRoomPayload, JoinRoomPayload } from '@word-mahjong/common';

export const games: Record<string, Game> = {};

// A map to hold disconnection timers for players
const disconnectTimers: Record<string, NodeJS.Timeout> = {};

export function registerRoomHandlers(io: Server, socket: Socket) {
  // Attach roomId to socket for easier lookup on disconnect
  let socketRoomId: string | null = null;

  const createRoom = (payload: CreateRoomPayload) => {
    const roomId = Math.random().toString(36).substring(2, 7);
    socketRoomId = roomId;
    
    const onUpdate = () => {
      io.to(roomId).emit('gameStateUpdate', game);
    };

    const game = new Game(roomId, onUpdate, payload.customDeck);
    games[roomId] = game;
    
    const player = new Player(socket.id, payload.username);
    game.addPlayer(player);

    socket.join(roomId);
    // The game.addPlayer will trigger the onUpdate, so this emit is redundant
    // socket.emit('gameStateUpdate', game); 
    console.log(`Room ${roomId} created by ${payload.username}`);
  };

  const joinRoom = (payload: JoinRoomPayload) => {
    const game = games[payload.roomId];
    if (!game) {
      socket.emit('gameError', { message: 'Room not found.' });
      return;
    }

    // Reconnection logic
    const disconnectedPlayer = Object.values(game.players).find(
      p => p.name === payload.username && p.status === 'disconnected'
    );

    if (disconnectedPlayer) {
      console.log(`Player ${payload.username} is reconnecting.`);
      // Clear any existing disconnect timer
      if (disconnectTimers[disconnectedPlayer.id]) {
        clearTimeout(disconnectTimers[disconnectedPlayer.id]);
        delete disconnectTimers[disconnectedPlayer.id];
      }

      // Update player with new socket id and status
      const oldSocketId = disconnectedPlayer.id;
      game.players[socket.id] = disconnectedPlayer;
      disconnectedPlayer.id = socket.id;
      disconnectedPlayer.status = 'online';
      delete game.players[oldSocketId];
      
      socketRoomId = payload.roomId;
      socket.join(payload.roomId);
      io.to(payload.roomId).emit('gameStateUpdate', game); // Manually send update on reconnect
      return;
    }

    if (Object.keys(game.players).length >= 4) {
      socket.emit('gameError', { message: 'Room is full.' });
      return;
    }

    const player = new Player(socket.id, payload.username);
    game.addPlayer(player);
    socketRoomId = payload.roomId;

    socket.join(payload.roomId);
    // game.addPlayer will trigger onUpdate
    
    if (Object.keys(game.players).length === 2 && game.gameState === 'waiting') {
      console.log(`Two players in room ${payload.roomId}. Starting game.`);
      game.startGame();
    }
    
    console.log(`${payload.username} joined room ${payload.roomId}`);
  };

  const handleDisconnect = () => {
    if (!socketRoomId) return;
    const game = games[socketRoomId];
    if (!game) return;

    const player = game.getPlayer(socket.id);
    if (player) {
      player.status = 'disconnected';
      console.log(`Player ${player.name} disconnected.`);
      io.to(socketRoomId).emit('gameStateUpdate', game);

      // Set a timer to mark the player as 'managed' if they don't reconnect
      disconnectTimers[player.id] = setTimeout(() => {
        player.status = 'managed';
        console.log(`Player ${player.name} is now managed.`);
        io.to(socketRoomId!).emit('gameStateUpdate', game);
      }, 180000); // 3 minutes
    }
  };

  socket.on('createRoom', createRoom);
  socket.on('joinRoom', joinRoom);
  socket.on('disconnect', handleDisconnect);
}
