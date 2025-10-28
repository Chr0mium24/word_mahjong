const roomHandlers = require('./roomHandlers');
const gameHandlers = require('./gameHandlers');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`A user connected: ${socket.id}`);

    roomHandlers(io, socket);
    gameHandlers(io, socket);

    socket.on('disconnect', () => {
      console.log(`A user disconnected: ${socket.id}`);
    });
  });
};
