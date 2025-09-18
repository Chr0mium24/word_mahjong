import React, { useContext } from 'react';
import { Stage, Layer } from 'react-konva';
import { GameStateContext } from '../../context/GameStateContext';
import { SocketContext } from '../../context/SocketContext';
import Tile from './Tile';

function GameCanvas() {
    const { gameState } = useContext(GameStateContext);
    const socket = useContext(SocketContext);

    if (!gameState || !gameState.players) {
        return null; // or a loading state
    }

    const me = gameState.players[socket.id];
    if (!me) return null; // Player not in game state yet

    // TODO: 完善其他玩家的牌和弃牌区的渲染逻辑
    // 这只是一个基础的渲染自己手牌的示例

    const handlePlayTile = (tileId) => {
        if (gameState.turn === socket.id) {
            socket.emit('playTile', { tileId });
        } else {
            console.log("Not your turn!");
        }
    };

    const handleMoveTile = (tileId, finalPosition) => {
        // 可以在这里做一些客户端的即时反馈
        // 然后将最终位置发送给服务器
        socket.emit('moveTileInHand', { tileId, finalPosition });
    };

    return (
        <div className="w-full h-full bg-green-900 rounded-lg">
            <Stage width={window.innerWidth * 0.7} height={window.innerHeight * 0.8}>
                <Layer>
                    {/* 渲染我自己的手牌 */}
                    {me.hand.map((tile, index) => (
                        <Tile
                            key={tile.id}
                            id={tile.id}
                            x={100 + index * 65}
                            y={window.innerHeight * 0.8 - 120}
                            char={tile.char}
                            isFaceUp={true}
                            onDoubleClick={() => handlePlayTile(tile.id)}
                            onDragEnd={(pos) => handleMoveTile(tile.id, pos)}
                        />
                    ))}

                    {/* TODO: 渲染其他玩家的手牌（牌背） */}
                    {/* TODO: 渲染所有玩家的弃牌区 */}
                </Layer>
            </Stage>
        </div>
    );
}

export default GameCanvas;