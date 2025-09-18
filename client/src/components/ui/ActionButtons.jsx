import React, { useContext, useState } from 'react';
import { GameStateContext } from '../../context/GameStateContext';
import { SocketContext } from '../../context/SocketContext';

function ActionButtons() {
    const { gameState } = useContext(GameStateContext);
    const socket = useContext(SocketContext);
    const [isClaiming, setIsClaiming] = useState(false); // 防止重复点击

    if (!gameState) return null;

    const me = gameState.players[socket.id];
    if (!me) return null;

    // TODO: 实现更精确的"吃"和"胡"的逻辑判断
    const canChow = true; // 简化：假设总是可以尝试吃
    const canWin = true;  // 简化：假设总是可以尝试胡

    const handleClaimWin = () => {
        if (isClaiming) return;
        setIsClaiming(true);
        // "胡牌"时，发送所有手牌
        socket.emit('claimAction', { type: 'win', tiles: me.hand });
        setTimeout(() => setIsClaiming(false), 2000); // 2秒冷却
    };

    const handleClaimChow = () => {
        if (isClaiming) return;
        // 实际游戏中，这里需要一个UI让玩家选择哪两张牌来"吃"
        // 为简化，我们假设玩家会神奇地选择正确的牌
        // 在真实项目中，你需要一个选择牌的模态框
        console.log("吃牌操作需要UI选择，此处为占位符");
        alert("请在Canvas中选择两张牌来'吃'（此功能待实现）");
        // socket.emit('claimAction', { type: 'chow', tiles: [tile1, tile2, lastPlayedTile] });
    };


    return (
        <div className="mt-auto flex gap-4">
            <button
                onClick={handleClaimChow}
                disabled={!canChow || isClaiming || gameState.gameState === 'voting'}
                className="flex-1 px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                吃
            </button>
            <button
                onClick={handleClaimWin}
                disabled={!canWin || isClaiming || gameState.gameState === 'voting'}
                className="flex-1 px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
                胡
            </button>
        </div>
    );
}

export default ActionButtons;