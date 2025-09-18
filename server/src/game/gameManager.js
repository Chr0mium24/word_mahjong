// GameManager.js
const { Game } = require('./Game');

class GameManager {
    constructor(io) {
        this.io = io;
        this.games = new Map(); // 使用 Map 存储所有活跃的游戏房间实例
    }

    /**
     * 为新的 socket 连接设置所有游戏事件的监听器。
     * @param {import('socket.io').Socket} socket
     */
    setupSocketListeners(socket) {
        const events = [
            'joinRoom',
            'moveTileInHand',
            'playTile',
            'claimAction',
            'submitVote'
        ];

        events.forEach(event => {
            socket.on(event, (data) => {
                // 从 socket.rooms 中找到玩家所在的房间ID
                // 注意：玩家加入的第一个房间通常是自己的ID，第二个才是游戏房间
                const roomId = Array.from(socket.rooms)[1];
                if (roomId) {
                    const game = this.games.get(roomId);
                    if (game && typeof game[event] === 'function') {
                        // 调用对应 Game 实例的方法来处理事件
                        game[event](socket.id, data);
                    } else {
                         console.warn(`房间 ${roomId} 不存在或没有 ${event} 方法`);
                    }
                } else if(event === 'joinRoom') {
                    // 特殊处理 joinRoom，因为它在加入房间之前被调用
                    this.joinRoom(socket, data);
                }
            });
        });
    }

    /**
     * 处理玩家加入房间的逻辑。
     * @param {import('socket.io').Socket} socket
     * @param {{username: string, roomId: string}} data
     */
    joinRoom(socket, { username, roomId }) {
        let game = this.games.get(roomId);

        // 如果房间不存在，则创建一个新游戏实例
        if (!game) {
            console.log(`创建新房间: ${roomId}`);
            game = new Game(roomId, this.io);
            this.games.set(roomId, game);
        }

        socket.join(roomId);
        game.addPlayer(socket, username);
    }
    
    /**
     * 处理玩家断开连接的逻辑。
     * @param {import('socket.io').Socket} socket
     */
    handleDisconnect(socket) {
        // 遍历所有游戏实例，检查该玩家是否在其中
        for (const [roomId, game] of this.games.entries()) {
            if (game.state.players[socket.id]) {
                game.removePlayer(socket.id);
                console.log(`玩家 ${socket.id} 已从房间 ${roomId} 移除`);
                
                // 修正: 检查 game.state.players 的长度
                if (Object.keys(game.state.players).length === 0) {
                    this.games.delete(roomId);
                    console.log(`房间 ${roomId} 已空，已被关闭`);
                }
                break; // 找到后即可退出循环
            }
        }
    }
}

module.exports = { GameManager };