import React, { useState } from 'react';

function Lobby({ onJoin }) {
    const [nickname, setNickname] = useState('');
    const [roomId, setRoomId] = useState('');

    const handleJoin = (e) => {
        e.preventDefault();
        if (nickname.trim() && roomId.trim()) {
            onJoin(nickname, roomId);
        }
    };

    return (
        <div className="p-8 bg-gray-900 rounded-lg shadow-xl text-center">
            <h1 className="text-4xl font-bold mb-6 text-yellow-400">Word Mahjong</h1>
            <form onSubmit={handleJoin} className="space-y-4">
                <input
                    type="text"
                    placeholder="输入您的昵称"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <input
                    type="text"
                    placeholder="输入房间号"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                    type="submit"
                    disabled={!nickname.trim() || !roomId.trim()}
                    className="w-full px-4 py-3 rounded bg-yellow-600 hover:bg-yellow-500 text-white font-bold transition duration-200 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    进入房间
                </button>
            </form>
        </div>
    );
}

export default Lobby;