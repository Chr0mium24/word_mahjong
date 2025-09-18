import React from 'react';

function PlayerInfo({ players, myId }) {
    const playerList = Object.values(players);

    return (
        <div>
            <h3 className="text-xl font-semibold mb-2">玩家列表</h3>
            <ul className="space-y-2">
                {playerList.map(player => (
                    <li
                        key={player.id}
                        className={`p-2 rounded ${player.id === myId ? 'bg-yellow-800' : 'bg-gray-700'}`}
                    >
                        <span className="font-bold">{player.username}</span>
                        {player.id === myId && ' (你)'}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PlayerInfo;