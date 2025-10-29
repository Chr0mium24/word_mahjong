import { Server, Socket } from 'socket.io';
import { Game } from '../game/Game';
import { PlayTilePayload } from '@word-mahjong/common';

import { games } from './roomHandlers';

export function registerGameHandlers(io: Server, socket: Socket) {

    const startGame = ({ roomId }: { roomId: string }) => {
        const game = games[roomId];
        if (game) {
            try {
                game.startGame();
                // 广播游戏状态更新
                io.to(roomId).emit('gameStateUpdate', game.gameState);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred';
                socket.emit('gameError', { message });
            }
        } else {
            socket.emit('gameError', { message: `Game in room ${roomId} not found.` });
        }
    };

    const playTile = ({ tileId }: PlayTilePayload) => {
        // 查找玩家所在的房间
        const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
        if (!roomId) {
            socket.emit('gameError', { message: 'You are not in a room.' });
            return;
        }

        const game = games[roomId];
        if (game) {
            try {
                game.playTile(socket.id, tileId);
                // 广播游戏状态更新
                io.to(roomId).emit('gameStateUpdate', game.gameState);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred during playTile';
                socket.emit('gameError', { message });
            }
        } else {
            socket.emit('gameError', { message: `Game in room ${roomId} not found.` });
        }
    };

    const readyForNextGame = () => {
        const roomId = Array.from(socket.rooms).find(r => r !== socket.id);
        if (!roomId) {
            socket.emit('gameError', { message: 'You are not in a room.' });
            return;
        }

        const game = games[roomId as string];
        if (game) {
            try {
                const player = game.getPlayer(socket.id);
                if (player) {
                    player.isReady = true;
                } else {
                    // 如果玩家不存在，提前抛出错误
                    throw new Error("Player not found in this game.");
                }

                const allPlayersReady = Object.values(game.players).every(p => p.isReady);

                if (allPlayersReady) {
                    game.resetForNextGame();
                    // 在 Game 类内部处理重置 isReady 状态可能更清晰
                    game.startGame();
                    // 广播游戏开始的状态
                    io.to(roomId).emit('gameStateUpdate', game.gameState);
                } else {
                    // 可以选择性地通知其他玩家某人已准备好
                    io.to(roomId).emit('playerReadyUpdate', { playerId: socket.id, isReady: true });
                }
            } catch (error) {
                const message = error instanceof Error ? error.message : 'An unknown error occurred while getting ready';
                socket.emit('gameError', { message });
            }
        } else {
            socket.emit('gameError', { message: `Game in room ${roomId} not found.` });
        }
    };

    // 将所有事件监听器注册在函数内部
    socket.on('startGame', startGame);
    socket.on('playTile', playTile);
    socket.on('readyForNextGame', readyForNextGame);
}