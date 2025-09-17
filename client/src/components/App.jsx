import React, { useState, useEffect } from 'react';
import { SocketProvider, useSocket } from '../context/SocketContext';
import { GameStateProvider, useGameStateUpdate } from '../context/GameStateContext';
import Lobby from './ui/Lobby';
import GameUI from './ui/GameUI';

const MainApp = () => {
    const socket = useSocket();
    const setGameState = useGameStateUpdate();
    const [playerId, setPlayerId] = useState(null);
    const [isInLobby, setIsInLobby] = useState(true);

    useEffect(() => {
        // 假设服务器在客户端连接时会发送一个'connected'事件，并附带其唯一的socket.id
        socket.on('connect', () => {
            console.log('Connected to server with id:', socket.id);
            setPlayerId(socket.id);
        });

        socket.on('gameStateUpdate', (newGameState) => {
            setGameState(newGameState);
            // 如果我们收到了游戏状态，意味着我们成功加入了房间
            if (newGameState) {
                setIsInLobby(false);
            }
        });

        // 清理工作
        return () => {
            socket.off('connect');
            socket.off('gameStateUpdate');
        };
    }, [socket, setGameState]);

    if (!playerId) {
        return <div>Connecting to server...</div>;
    }

    return (
        <div className="w-screen h-screen bg-gray-800 text-white">
            {isInLobby ? (
                <Lobby />
            ) : (
                <GameUI playerId={playerId} />
            )}
        </div>
    );
};

// 最终包裹所有Provider的入口
const App = () => (
    <SocketProvider>
        <GameStateProvider>
            <MainApp />
        </GameStateProvider>
    </SocketProvider>
);

export default App;