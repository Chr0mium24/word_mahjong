import { Server, Socket } from 'socket.io';
import { Game } from '../game/Game';
import { Player } from '../game/Player';
import { CreateRoomPayload, JoinRoomPayload } from '@word-mahjong/common';

export const games: Record<string, Game> = {};

export function registerRoomHandlers(io: Server, socket: Socket) {
  const createRoom = (payload: CreateRoomPayload) => {
    const roomId = Math.random().toString(36).substring(2, 7);
    const game = new Game(roomId, payload.customDeck);
    games[roomId] = game;
    
    const player = new Player(socket.id, payload.username);
    game.addPlayer(player);

    socket.join(roomId);
    socket.emit('gameStateUpdate', game);
    console.log(`Room ${roomId} created by ${payload.username}`);
  };

  const joinRoom = (payload: JoinRoomPayload) => {
    const game = games[payload.roomId];
    if (!game) {
      socket.emit('gameError', { message: 'Room not found.' });
      return;
    }

    if (Object.keys(game.players).length >= 4) {
      socket.emit('gameError', { message: 'Room is full.' });
      return;
    }

    const player = new Player(socket.id, payload.username);
    game.addPlayer(player);

    socket.join(payload.roomId);
    io.to(payload.roomId).emit('gameStateUpdate', game);
    console.log(`${payload.username} joined room ${payload.roomId}`);
  };

  socket.on('createRoom', createRoom);
  socket.on('joinRoom', joinRoom);
}
