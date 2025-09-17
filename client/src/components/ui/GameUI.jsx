// src/components/ui/GameUI.jsx

import React, { useEffect, useRef } from 'react'; // 引入 useEffect 和 useRef
import { useGameState } from '../../context/GameStateContext';
import { useSocket } from '../../context/SocketContext'; // 引入 useSocket
import GameCanvas from '../canvas/GameCanvas';
import PlayerInfo from './PlayerInfo';
import ActionButtons from './ActionButtons';
import VoteModal from './VoteModal';

const GameUI = ({ playerId }) => {
    const gameState = useGameState();
    const socket = useSocket(); // 获取 socket 实例

    // NEW: 使用 useRef 来追踪上一个回合的玩家
    const prevTurnRef = useRef(null);

    // NEW: 实现自动摸牌的 Effect
    useEffect(() => {
        if (!gameState || !playerId) return;

        // 检查是否轮到当前玩家，并且上一个回合不是当前玩家 (防止在同回合的其它状态更新时重复摸牌)
        if (gameState.turn === playerId && prevTurnRef.current !== playerId) {
            console.log("It's my turn, automatically drawing a tile.");
            socket.emit('drawTile');
        }

        // 更新上一个回合的玩家
        prevTurnRef.current = gameState.turn;

    }, [gameState, playerId, socket]); // 依赖项包含 gameState, playerId 和 socket

    if (!gameState) {
        return <div className="flex items-center justify-center h-full">Loading Game...</div>;
    }

    return (
        <div className="relative w-full h-full flex flex-col">
            <header className="flex-shrink-0 bg-gray-900 p-2 shadow-md flex justify-between items-center">
                <h1 className="text-xl font-bold text-teal-400">Verse Weavers - Room: {gameState.roomId}</h1>
                <PlayerInfo players={gameState.players} currentPlayerId={playerId} turn={gameState.turn} />
            </header>

            <main className="flex-grow relative">
                <GameCanvas tiles={gameState.tiles} playerId={playerId} />
            </main>

            <footer className="flex-shrink-0 bg-gray-900 p-3 flex justify-center">
                {/* MODIFIED: 现在的按钮只在轮到自己时才和 gameState 有关 */}
                <ActionButtons isMyTurn={gameState.turn === playerId} />
            </footer>

            {gameState.gameState === 'voting' && <VoteModal />}
        </div>
    );
};

export default GameUI;