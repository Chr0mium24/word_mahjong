import React from 'react';
import { useSocket } from '../../context/SocketContext';

const ActionButtons = ({ isMyTurn }) => {
    const socket = useSocket();

    const handleClaimVictory = () => socket.emit('claimVictory');

    const baseClasses = "px-6 py-2 mx-2 font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
    const enabledClasses = "bg-amber-500 hover:bg-amber-600 text-white shadow-lg";
    const disabledClasses = "bg-gray-600 text-gray-400 cursor-not-allowed";

    return (
        <div>
            {/* REMOVED: 摸牌按钮已被移除 */}
            <button
                onClick={handleClaimVictory}
                disabled={!isMyTurn} // 只有在你的回合才能宣布胜利
                className={`${baseClasses} ${isMyTurn ? enabledClasses : disabledClasses}`}
            >
                和牌
            </button>
        </div>
    );
};
export default ActionButtons;