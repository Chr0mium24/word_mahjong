import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState } from '@word-mahjong/common/types';
import { CreateRoomPayload, JoinRoomPayload, PlayTilePayload } from '@word-mahjong/common/events';
import Lobby from './components/Lobby';
import GameUI from './components/GameUI';
import ScoreboardModal from './components/ScoreboardModal';

// It's good practice to define the server URL in a constant
const SERVER_URL = 'http://localhost:3000';

const App: React.FC = () => {
    // Use a state for the socket to ensure it's defined when used
    const [socket, setSocket] = useState<Socket | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [username, setUsername] = useState('');

    useEffect(() => {
        // Initialize the socket connection
        const newSocket = io(SERVER_URL);
        setSocket(newSocket);

        // Set up event listeners
        newSocket.on('gameStateUpdate', (state: GameState) => {
            setGameState(state);
        });

        newSocket.on('gameError', (error: { message: string }) => {
            alert(`Error: ${error.message}`);
        });

        // Cleanup on component unmount
        return () => {
            newSocket.off('gameStateUpdate');
            newSocket.off('gameError');
            newSocket.disconnect();
        };
    }, []);

    const handleCreateRoom = (customDeck?: string) => {
        if (socket && username.trim()) {
            const payload: CreateRoomPayload = { username, customDeck };
            socket.emit('createRoom', payload);
        }
    };

    const handleJoinRoom = (roomId: string) => {
        if (socket && username.trim() && roomId.trim()) {
            const payload: JoinRoomPayload = { username, roomId };
            socket.emit('joinRoom', payload);
        }
    };

    const handlePlayTile = (tileId: string) => {
        if (socket) {
            const payload: PlayTilePayload = { tileId };
            socket.emit('playTile', payload);
        }
    };

    const handleReadyForNextGame = () => {
        if (socket) {
            socket.emit('readyForNextGame');
        }
    };

    // Determine the current player from gameState
    const currentPlayer = socket && socket.id && gameState ? gameState.players[socket.id] : null;

    const renderContent = () => {
        if (!gameState || !currentPlayer) {
            return (
                <Lobby
                    username={username}
                    setUsername={setUsername}
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                />
            );
        }

        if (gameState.gameState === 'ended') {
            return <ScoreboardModal gameState={gameState} onReadyForNextGame={handleReadyForNextGame} />;
        }

        return (
            <GameUI
                gameState={gameState}
                currentPlayer={currentPlayer}
                onPlayTile={handlePlayTile}
            />
        );
    };

    return <div>{renderContent()}</div>;
};

export default App;