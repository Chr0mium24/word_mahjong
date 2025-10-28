import React, { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, Tile } from '@word-mahjong/common';

const socket: Socket = io('http://localhost:3000');

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    socket.on('gameStateUpdate', (state: GameState) => {
      setGameState(state);
    });

    socket.on('gameError', (error: { message: string }) => {
      alert(error.message);
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('gameError');
    };
  }, []);

  const handleCreateRoom = () => {
    socket.emit('createRoom', { username });
  };

  const handleJoinRoom = () => {
    socket.emit('joinRoom', { username, roomId });
  };

  const handleStartGame = () => {
    if (gameState) {
      socket.emit('startGame', { roomId: gameState.roomId });
    }
  };

  const handlePlayTile = (tileId: string) => {
    socket.emit('playTile', { tileId });
  };

  if (!gameState) {
    return (
      <div>
        <h1>Word Mahjong</h1>
        <input
          type="text"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button onClick={handleCreateRoom}>Create Room</button>
        <hr />
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={handleJoinRoom}>Join Room</button>
      </div>
    );
  }

  const me = gameState.players[socket.id];

  return (
    <div>
      <h1>Room: {gameState.roomId}</h1>
      <h2>Players:</h2>
      <ul>
        {Object.values(gameState.players).map((p) => (
          <li key={p.id}>{p.name} {p.id === socket.id && '(You)'}</li>
        ))}
      </ul>

      {gameState.gameState === 'waiting' && (
        <div>
          <p>Waiting for players... ({Object.keys(gameState.players).length}/4)</p>
          {Object.keys(gameState.players).length === 4 && <button onClick={handleStartGame}>Start Game</button>}
        </div>
      )}

      {gameState.gameState === 'playing' && me && (
        <div>
          <h2>Your Hand:</h2>
          <div>
            {me.hand.map((tile) => (
              <button key={tile.id} onDoubleClick={() => handlePlayTile(tile.id)}>
                {tile.text}
              </button>
            ))}
          </div>
          <h3>Discard Pile:</h3>
          <div>
            {gameState.discards.map((tile, i) => (
              <span key={i}>{tile.text}</span>
            ))}
          </div>
          {gameState.turn === socket.id ? <h3>Your Turn</h3> : <h3>Turn: {gameState.players[gameState.turn]?.name}</h3>}
        </div>
      )}
    </div>
  );
};

export default App;
