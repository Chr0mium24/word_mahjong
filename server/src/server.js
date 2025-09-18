// server.js
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const cors = require('cors');
const { GameManager } = require('./GameManager');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        // 确保这里是你的前端访问地址
        origin: "http://localhost:3000", // React 默认是 3000
        methods: ["GET", "POST"]
    }
});

const gameManager = new GameManager(io);

io.on('connection', (socket) => {
    console.log(`用户已连接: ${socket.id}`);

    // 将 io 和 socket 实例传递给管理器进行事件绑定
    gameManager.setupSocketListeners(socket);

    socket.on('disconnect', () => {
        console.log(`用户已断开连接: ${socket.id}`);
        gameManager.handleDisconnect(socket);
    });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
    console.log(`“字牌风云”服务器正在端口 ${PORT} 上运行`);
});