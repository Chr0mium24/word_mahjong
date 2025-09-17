// 在文件顶部
const { createNewGameState } = require('./GameState');
const gameRooms = new Map(); // 使用Map来存储所有活跃的游戏房间

/**
 * 为特定玩家过滤游戏状态，隐藏不应看到的信息。
 * @param {object} gameState - 完整的游戏状态。
 * @param {string} playerId - 请求状态的玩家的socket.id。
 * @returns {object} - 过滤后的安全游戏状态。
 */
function filterGameStateForPlayer(gameState, playerId) {
    const filteredState = JSON.parse(JSON.stringify(gameState)); // 深拷贝以避免修改原始状态

    filteredState.tiles = filteredState.tiles.map(tile => {
        // 如果牌不属于该玩家，并且尚未被打出（非公开），则隐藏文字
        if (tile.owner !== playerId && !tile.isPublic) {
            delete tile.char;
        }
        return tile;
    });

    return filteredState;
}

/**
 * 向房间内的所有玩家广播最新的游戏状态。
 * 每个玩家都会收到根据其视角过滤后的状态。
 * @param {string} roomId - 房间ID。
 * @param {import('socket.io').Server} io - Socket.IO服务器实例。
 */
function broadcastGameState(roomId, io) {
    const gameState = gameRooms.get(roomId);
    if (!gameState) return;

    // 获取房间内所有连接的客户端ID
    const clients = io.sockets.adapter.rooms.get(roomId);
    if (!clients) return;

    for (const clientId of clients) {
        const filteredState = filterGameStateForPlayer(gameState, clientId);
        io.to(clientId).emit('gameStateUpdate', filteredState);
    }
}

// 导出所有游戏逻辑函数
module.exports = {
    gameRooms, // 导出以便在server.js中断开连接时使用

    handleJoinRoom(socket, io, { roomId, playerName }) {
        let gameState = gameRooms.get(roomId);

        // 如果房间不存在，则创建一个新房间
        if (!gameState) {
            gameState = createNewGameState(roomId);
            gameRooms.set(roomId, gameState);
        }

        // 添加新玩家
        socket.join(roomId);
        gameState.players[socket.id] = { name: playerName };

        // 如果这是第一个玩家，设定他为当前回合
        if (!gameState.turn) {
            gameState.turn = socket.id;
            gameState.gameState = 'playing'; // 可以设置为等待更多玩家的状态
        }

        console.log(`Player ${playerName} (${socket.id}) joined room ${roomId}`);
        broadcastGameState(roomId, io);
    },

    handleMoveTile(socket, { tileId, position }) {
        const roomId = Array.from(socket.rooms).pop(); // 获取玩家所在的房间
        const gameState = gameRooms.get(roomId);
        if (!gameState) return;

        const tile = gameState.tiles.find(t => t.id === tileId);
        // 安全性校验：确保移动的是自己的牌
        if (tile && tile.owner === socket.id) {
            tile.pos = position;
            // 使用 socket.to(...).emit 广播给房间内除自己外的所有人
            socket.to(roomId).emit('tileMoved', { tileId, position });
        }
    },

    handleDrawTile(socket, io) {
        const roomId = Array.from(socket.rooms).pop();
        const gameState = gameRooms.get(roomId);
        if (!gameState || gameState.turn !== socket.id || gameState.gameState !== 'playing') {
            return; // 无效操作
        }

        const availableTile = gameState.tiles.find(t => t.owner === null);
        if (availableTile) {
            availableTile.owner = socket.id;
            // 为新牌设置一个默认位置（例如，玩家手牌区）
            availableTile.pos = { x: Math.random() * 400 + 100, y: 600 };

            // 私信新牌的完整信息给抽牌玩家
            socket.emit('newTile', availableTile);

            // 轮换回合 (简单实现)
            const playerIds = Object.keys(gameState.players);
            const currentIndex = playerIds.indexOf(socket.id);
            const nextIndex = (currentIndex + 1) % playerIds.length;
            gameState.turn = playerIds[nextIndex];

            broadcastGameState(roomId, io);
        }
    },

    handleClaimVictory(socket, io) {
        const roomId = Array.from(socket.rooms).pop();
        const gameState = gameRooms.get(roomId);
        if (!gameState || gameState.turn !== socket.id || gameState.gameState !== 'playing') {
            return;
        }

        gameState.gameState = 'voting';
        gameState.claimantId = socket.id;
        gameState.votes = {}; // 重置投票

        console.log(`Player ${socket.id} is claiming victory in room ${roomId}`);
        io.to(roomId).emit('startVote', { claimantId: socket.id });
        broadcastGameState(roomId, io); // 广播状态以显示投票模态框
    },
    handlePlayTile(socket, io, { tileId, position }) {
        // 从 socket 的 room 集合中获取当前的房间 ID
        const roomId = Array.from(socket.rooms).pop();
        // 获取当前房间的游戏状态
        const gameState = gameRooms.get(roomId);

        // --- 安全性与状态验证 ---
        // 检查游戏状态是否存在、是否轮到当前玩家出牌、游戏是否处于“进行中”状态
        if (!gameState || gameState.turn !== socket.id || gameState.gameState !== 'playing') {
            console.warn(`玩家 ${socket.id} 在房间 ${roomId} 中尝试无效的 'playTile' 操作。`);
            return;
        }

        // 查找玩家出的牌
        const tile = gameState.tiles.find(t => t.id === tileId);
        // 验证这块牌是否存在以及是否属于当前玩家
        if (!tile || tile.owner !== socket.id) {
            console.warn(`玩家 ${socket.id} 试图打出一块不属于自己的牌。`);
            return;
        }

        // --- 更新游戏状态 ---
        // 将牌标记为公开
        tile.isPublic = true;
        // 更新牌在公共区域的最终位置
        tile.pos = position;

        console.log(`玩家 ${socket.id} 在房间 ${roomId} 中打出了 '${tile.char}' 牌`);

        // --- 轮换出牌权 ---
        // 获取所有玩家的 ID 列表
        const playerIds = Object.keys(gameState.players);
        // 找到当前玩家在列表中的索引
        const currentIndex = playerIds.indexOf(socket.id);
        // 计算下一个玩家的索引，实现循环轮换
        const nextIndex = (currentIndex + 1) % playerIds.length;
        // 更新轮到的玩家
        gameState.turn = playerIds[nextIndex];

        // --- 广播更新后的游戏状态 ---
        broadcastGameState(roomId, io);
    },

    handleSubmitVote(socket, io, { decision }) {
        // 获取房间 ID 和游戏状态
        const roomId = Array.from(socket.rooms).pop();
        const gameState = gameRooms.get(roomId);

        // --- 安全性与状态验证 ---
        // 检查游戏是否处于“投票中”状态
        if (!gameState || gameState.gameState !== 'voting') {
            return; // 游戏不处于投票状态，直接返回
        }
        // 宣布胜利的玩家（claimant）不能投票
        if (socket.id === gameState.claimantId) {
            return;
        }
        // 检查玩家是否已经投过票
        if (gameState.votes[socket.id]) {
            return;
        }
        // 验证投票决定是否有效（必须是'approve'或'deny'）
        if (decision !== 'approve' && decision !== 'deny') {
            return;
        }

        // --- 记录投票 ---
        gameState.votes[socket.id] = decision;
        console.log(`在房间 ${roomId} 中记录到来自 ${socket.id} 的投票: '${decision}'`);

        // --- 检查投票是否全部完成 ---
        const totalPlayers = Object.keys(gameState.players).length;
        // 所需的票数等于总玩家数减一（宣布胜利者除外）
        const requiredVotes = totalPlayers - 1;

        if (Object.keys(gameState.votes).length >= requiredVotes) {
            // 计票
            let approveVotes = 0;
            let denyVotes = 0;
            for (const vote of Object.values(gameState.votes)) {
                if (vote === 'approve') approveVotes++;
                if (vote === 'deny') denyVotes++;
            }
            
            console.log(`房间 ${roomId} 的投票结束。同意票: ${approveVotes}, 否决票: ${denyVotes}`);

            // 如果同意票多于否决票，则结果为'success'
            const result = approveVotes > denyVotes ? 'success' : 'failure';

            // 准备要发送的结果数据
            const resultPayload = { result };

            if (result === 'success') {
                // 如果投票成功，游戏状态变为“已结束”
                gameState.gameState = 'ended';
                // 找到所有公开的牌，以显示最终的诗句
                resultPayload.poemTiles = gameState.tiles.filter(t => t.isPublic);
            } else {
                // 如果投票失败，游戏回到“进行中”状态
                gameState.gameState = 'playing';
                // 宣布胜利者的回合已经过去，所以只需重置 claimantId
                gameState.claimantId = null;
            }
            
            // 向房间内的所有玩家宣布投票结果
            io.to(roomId).emit('voteResult', resultPayload);
            
            // 广播最终的或恢复后的游戏状态
            broadcastGameState(roomId, io);
        }
    },

    handleDisconnect(socket, io) {
        // 遍历所有房间，查找该玩家
        for (const [roomId, gameState] of gameRooms.entries()) {
            if (gameState.players[socket.id]) {
                console.log(`Player ${gameState.players[socket.id].name} (${socket.id}) disconnected from room ${roomId}`);
                delete gameState.players[socket.id];

                // 如果房间空了，可以考虑删除房间
                if (Object.keys(gameState.players).length === 0) {
                    gameRooms.delete(roomId);
                    console.log(`Room ${roomId} is now empty and has been closed.`);
                } else {
                    // 如果断开的是当前回合的玩家，把回合交给下一个人
                    if (gameState.turn === socket.id) {
                        const playerIds = Object.keys(gameState.players);
                        gameState.turn = playerIds[0]; // 简单地交给剩下的第一个玩家
                    }
                    broadcastGameState(roomId, io);
                }
                break;
            }
        }
    }
};