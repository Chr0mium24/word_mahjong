const express = require('express'); // 引入 Express 框架，用于构建 Web 应用程序。
const http = require('http'); // 引入 Node.js 内置的 HTTP 模块，用于创建 HTTP 服务器。
const { Server } = require('socket.io'); // 从 'socket.io' 库中解构出 Server 类，用于实现实时、双向的基于事件的通信。
const cors = require('cors'); // 引入 CORS 中间件，用于处理跨域资源共享。
const gameManager = require('./game/gameManager'); // 引入自定义的游戏逻辑管理器。

const app = express(); // 创建一个 Express 应用实例。
app.use(cors()); // 在 Express 应用中使用 CORS 中间件，以允许跨域请求。

const server = http.createServer(app); // 使用 Express 应用实例创建一个 HTTP 服务器。

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // 指定允许连接的前端应用的源地址。
        methods: ["GET", "POST"] // 指定允许的 HTTP 请求方法。
    }
}); // 创建一个 Socket.IO 服务器实例，并配置 CORS 选项。

// 当有客户端连接时触发
io.on('connection', (socket) => {
    console.log('一个用户已连接:', socket.id);

    // 监听客户端触发的事件
    socket.on('joinRoom', (data) => {
        gameManager.handleJoinRoom(socket, io, data); // 处理客户端加入房间的请求。
    });

    socket.on('moveTile', (data) => {
        gameManager.handleMoveTile(socket, data); // 处理客户端移动牌块的动作。
    });

    socket.on('drawTile', () => {
        gameManager.handleDrawTile(socket, io); // 处理客户端摸牌的动作。
    });
    
    socket.on('playTile', (data) => {
        gameManager.handlePlayTile(socket, io, data); // 处理客户端出牌的动作。
    });

    socket.on('claimVictory', () => {
        gameManager.handleClaimVictory(socket, io); // 处理客户端宣告胜利的请求。
    });
    
    socket.on('submitVote', (data) => {
        gameManager.handleSubmitVote(socket, io, data); // 处理客户端提交投票的动作。
    });

    // 当有客户端断开连接时触发
    socket.on('disconnect', () => {
        console.log('用户已断开连接:', socket.id);
        gameManager.handleDisconnect(socket, io); // 处理客户端断开连接的事件。
    });
});

const PORT = process.env.PORT || 4000; // 设置服务器监听的端口号，优先使用环境变量中的 PORT，否则使用 4000。
server.listen(PORT, () => {
    console.log(`Verse Weavers 服务器正在端口 ${PORT} 上监听`); // 启动服务器并打印日志。
});