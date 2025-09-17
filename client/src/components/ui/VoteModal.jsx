import React, { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useGameState } from '../../context/GameStateContext';

const VoteModal = () => {
    const socket = useSocket();
    const gameState = useGameState();
    const [countdown, setCountdown] = useState(15); // 假设投票时间15秒

    const claimant = gameState.players[gameState.claimantId]?.name || 'A player';

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleVote = (decision) => {
        socket.emit('submitVote', { decision });
        // 可以添加一个状态来禁用按钮，防止重复投票
    };

    return (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 border border-teal-500 rounded-lg shadow-xl p-8 max-w-md w-full text-center">
                <h2 className="text-2xl font-bold mb-4">{claimant} has claimed victory!</h2>
                <p className="mb-6 text-gray-300">Do you approve their verse?</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => handleVote('approve')}
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
                    >
                        Approve
                    </button>
                    <button
                        onClick={() => handleVote('deny')}
                        className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-transform transform hover:scale-105"
                    >
                        Deny
                    </button>
                </div>
                <div className="mt-6 text-lg font-mono text-amber-400">
                    {countdown}
                </div>
            </div>
        </div>
    );
};

export default VoteModal;