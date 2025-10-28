const http = require('http');
const app = require('./app');
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);
require('./socket')(io);

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
