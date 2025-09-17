import React from 'react';
import { useSocket } from '../../context/SocketContext';

const ActionButtons = ({ isMyTurn, gameState }) => {
    const socket = useSocket();

    const handleDraw = () => socket.emit('drawTile');
    const handleClaimVictory = () => socket.emit('claimVictory');

    const baseClasses = "px-6 py-2 mx-2 font-bold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
    const enabledClasses = "bg-teal-500 hover:bg-teal-600 text-white shadow-lg";
    const disabledClasses = "bg-gray-600 text-gray-400 cursor-not-allowed";

    const isPlaying = gameState === 'playing';

    return (
        <div>
            <button
                onClick={handleDraw}
                disabled={!isMyTurn || !isPlaying}
                className={`${baseClasses} ${isMyTurn && isPlaying ? enabledClasses : disabledClasses}`}
            >
                Draw Tile
            </button>
            <button
                onClick={handleClaimVictory}
                disabled={!isMyTurn || !isPlaying}
                className={`${baseClasses} ${isMyTurn && isPlaying ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg' : disabledClasses}`}
            >
                I Weave the Verse! (Claim)
            </button>
        </div>
    );
};

export default ActionButtons;