import React from 'react';

const PlayerInfo = ({ players, currentPlayerId, turn }) => {
    return (
        <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-400">Players:</span>
            <ul className="flex space-x-3">
                {Object.entries(players).map(([id, player]) => (
                    <li
                        key={id}
                        className={`px-3 py-1 rounded-full text-sm font-medium border-2
            ${id === currentPlayerId ? 'bg-teal-500 border-teal-400 text-white' : 'bg-gray-700 border-gray-600'}
            ${id === turn ? 'animate-pulse ring-2 ring-amber-400' : ''}
            `}
                    >
                        {player.name} {id === currentPlayerId && "(You)"}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlayerInfo;