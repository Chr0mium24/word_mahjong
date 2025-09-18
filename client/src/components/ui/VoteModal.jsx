import React, { useState, useEffect, useContext } from 'react';
import { SocketContext } from '../../context/SocketContext';

function VoteModal({ voteData, onClose }) {
    const [timeLeft, setTimeLeft] = useState(10);
    const [voted, setVoted] = useState(false);
    const socket = useContext(SocketContext);

    useEffect(() => {
        if (timeLeft <= 0) {
            if (!voted) {
                // 时间到，自动算同意，但我们这里只关闭窗口，服务器会处理默认同意
                onClose();
            }
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onClose, voted]);

    const handleVote = (decision) => {
        setVoted(true);
        socket.emit('submitVote', { decision });
        // 不立即关闭，等待服务器的 voteResult 事件来统一关闭
    };

    const { claimantName, claimType, claimedTiles } = voteData;
    const actionText = claimType === 'win' ? '宣布胡牌' : '试图吃牌';
    const displayContent = claimedTiles.map(tile => tile.char || tile).join(' ');


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg shadow-xl p-8 text-center max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 text-yellow-400">
                    投票请求 ({timeLeft}s)
                </h2>
                <p className="text-lg mb-2">
                    玩家 <span className="font-bold">{claimantName}</span> {actionText}！
                </p>
                <div className="bg-gray-900 p-4 rounded-md my-4">
                    <p className="text-gray-400">内容：</p>
                    <p className="text-3xl font-serif tracking-widest">{displayContent}</p>
                </div>
                <div className="flex justify-center gap-4 mt-6">
                    <button
                        onClick={() => handleVote('approve')}
                        disabled={voted}
                        className="px-8 py-3 rounded-lg bg-green-600 hover:bg-green-500 text-white font-bold text-lg transition duration-200 disabled:bg-gray-500"
                    >
                        同意
                    </button>
                    <button
                        onClick={() => handleVote('deny')}
                        disabled={voted}
                        className="px-8 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold text-lg transition duration-200 disabled:bg-gray-500"
                    >
                        反对
                    </button>
                </div>
                {voted && <p className="mt-4 text-gray-400">已投票，等待结果...</p>}
            </div>
        </div>
    );
}

export default VoteModal;