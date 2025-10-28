import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import { registerRoomHandlers } from './socket/roomHandlers';
import { registerGameHandlers } from './socket/gameHandlers';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for now
  },
});

io.on('connection', (socket) => {
  console.log('a user connected:', socket.id);

  registerRoomHandlers(io, socket);
  registerGameHandlers(io, socket);

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
    // Here you would need to find which game the player was in and remove them.
    // This logic will be more complex and will be handled later.
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
