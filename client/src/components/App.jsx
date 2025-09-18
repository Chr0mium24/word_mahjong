import React, { useState, useContext } from 'react';
import Lobby from './ui/Lobby';
import GameUI from './ui/GameUI';
import { GameStateProvider } from '../context/GameStateContext';
import { SocketContext } from '../context/SocketContext';
import useSocketListener from '../hooks/useSocketListener';
function App() {
    const [isInRoom, setIsInRoom] = useState(false);
    const [username, setUsername] = useState('');
    const [roomId, setRoomId] = useState('');
    const socket = useContext(SocketContext);
    // 监听加入房间成功事件
    useSocketListener('joinSuccess', ({ username, roomId }) => {
        setUsername(username);
        setRoomId(roomId);
        setIsInRoom(true);
    });
    const handleJoinRoom = (nick, room) => {
        socket.emit('joinRoom', { username: nick, roomId: room });
    };
    return (
        <div className="bg-gray-800 text-white min-h-screen flex items-center justify-center font-sans">
            {!isInRoom ? (
                <Lobby onJoin={handleJoinRoom} />
            ) : (
                <GameStateProvider>
                    <GameUI username={username} roomId={roomId} />
                </GameStateProvider>
            )}
        </div>
    );
}
export default App;