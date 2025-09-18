import React, { useContext, useState, useEffect } from 'react';
import { GameStateContext } from '../../context/GameStateContext';
import { SocketContext } from '../../context/SocketContext';
import PlayerInfo from './PlayerInfo';
import ActionButtons from './ActionButtons';
import VoteModal from './VoteModal';
import GameCanvas from '../canvas/GameCanvas';
import useSocketListener from '../../hooks/useSocketListener';


function GameUI({ username, roomId }) {
    const { gameState } = useContext(GameStateContext);
    const socket = useContext(SocketContext);
    const [voteData, setVoteData] = useState(null);
    const [gameMessage, setGameMessage] = useState('');

    // 监听投票开始
    useSocketListener('startVote', (data) => {
        // 只有非发起者才需要投票
        if (gameState?.players[socket.id]?.username !== data.claimantName) {
            setVoteData(data);
        }
    });

    // 监听投票结果
    useSocketListener('voteResult', ({ result, type, claimantName }) => {
        setVoteData(null); // 关闭投票窗口
        const actionText = type === 'win' ? '胡牌' : '吃牌';
        const resultText = result === 'success' ? '成功' : '失败';
        setGameMessage(`玩家 ${claimantName} ${actionText} ${resultText}!`);
        setTimeout(() => setGameMessage(''), 3000); // 3秒后清除消息
    });

    if (!gameState) {
        return <div className="text-xl">正在加载游戏状态...</div>;
    }

    const isMyTurn = gameState.turn === socket.id;

    return (
        <div className="w-full h-screen p-4 flex flex-col lg:flex-row gap-4">
            {voteData && <VoteModal voteData={voteData} onClose={() => setVoteData(null)} />}

            {/* 游戏主区域 */}
            <div className="flex-grow flex flex-col relative">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 px-4 py-2 rounded-lg z-20">
                    {isMyTurn ? (
                        <p className="text-yellow-400 text-lg animate-pulse">轮到你了！</p>
                    ) : (
                        <p className="text-gray-300">等待 {gameState.players[gameState.turn]?.username || ''} 操作...</p>
                    )}
                </div>

                {gameMessage && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 bg-blue-800 bg-opacity-80 px-6 py-3 rounded-xl z-20 text-xl font-bold">
                        {gameMessage}
                    </div>
                )}

                <GameCanvas />
            </div>

            {/* 侧边栏 */}
            <div className="w-full lg:w-80 bg-gray-900 p-4 rounded-lg shadow-lg flex flex-col gap-4">
                <h2 className="text-2xl font-bold text-yellow-400 border-b-2 border-yellow-500 pb-2">房间: {roomId}</h2>
                <PlayerInfo players={gameState.players} myId={socket.id} />
                <ActionButtons />
            </div>
        </div>
    );
}

export default GameUI;