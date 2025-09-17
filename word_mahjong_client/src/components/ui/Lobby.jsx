import React, { useState } from 'react';
import { useSocket } from '../../context/SocketContext';

const Lobby = () => {
    const [roomId, setRoomId] = useState('');
    const [playerName, setPlayerName] = useState('');
    const socket = useSocket();

    const handleJoinRoom = (e) => {
        e.preventDefault();
        if (roomId && playerName) {
            socket.emit('joinRoom', { roomId, playerName });
        }
    };

    return (
        <div className="flex items-center justify-center h-full">
            <form onSubmit={handleJoinRoom} className="p-8 bg-gray-700 rounded-lg shadow-xl w-full max-w-sm">
                <h1 className="text-3xl font-bold mb-6 text-center text-teal-400">Verse Weavers</h1>
                <div className="mb-4">
                    <label htmlFor="playerName" className="block mb-2 text-sm font-medium text-gray-300">Player Name</label>
                    <input
                        id="playerName"
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />
                </div>
                <div className="mb-6">
                    <label htmlFor="roomId" className="block mb-2 text-sm font-medium text-gray-300">Room ID</label>
                    <input
                        id="roomId"
                        type="text"
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        required
                    />
                </div>
                <button type="submit" className="w-full py-2 px-4 bg-teal-600 hover:bg-teal-700 rounded-md font-bold transition-colors duration-200">
                    Join or Create Room
                </button>
            </form>
        </div>
    );
};

export default Lobby;