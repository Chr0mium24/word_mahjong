import React, { useState, useEffect } from 'react';
import { GameState, Player } from '@word-mahjong/common/types';

interface GameUIProps {
  gameState: GameState;
  currentPlayer: Player;
  onPlayTile: (tileId: string) => void;
}

const GameUI: React.FC<GameUIProps> = ({ gameState, currentPlayer, onPlayTile }) => {
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (gameState.gameState === 'playing') {
      const updateTimer = () => {
        const timeLeft = Math.round((gameState.turnExpiresAt - Date.now()) / 1000);
        setRemainingTime(timeLeft > 0 ? timeLeft : 0);
      };

      updateTimer(); // Initial update
      const timerId = setInterval(updateTimer, 1000);

      return () => clearInterval(timerId);
    }
  }, [gameState.turn, gameState.turnExpiresAt, gameState.gameState]);

  const isMyTurn = gameState.turn === currentPlayer.id;

  return (
    <div>
      <h1>房间: {gameState.roomId}</h1>
      <h2>玩家列表:</h2>
      <ul>
        {Object.values(gameState.players).map((p) => (
          <li key={p.id} style={{ fontWeight: gameState.turn === p.id ? 'bold' : 'normal' }}>
            {p.name} {p.id === currentPlayer.id && '(你)'}
          </li>
        ))}
      </ul>

      {gameState.gameState === 'waiting' && (
        <div>
          <p>等待玩家加入... ({Object.keys(gameState.players).length}/2)</p>
        </div>
      )}

      {gameState.gameState === 'playing' && (
        <div>
          <h2>你的手牌:</h2>
          <div>
            {currentPlayer.hand.map((tile) => (
              <button key={tile.id} onDoubleClick={() => onPlayTile(tile.id)} disabled={!isMyTurn}>
                {tile.text}
              </button>
            ))}
          </div>
          <h3>弃牌堆:</h3>
          <div>
            {gameState.discards.map((tile, i) => (
              <span key={`${tile.id}-${i}`} style={{ margin: '0 4px' }}>{tile.text}</span>
            ))}
          </div>
          <div style={{ marginTop: '20px', padding: '10px', border: '1px solid black' }}>
            {isMyTurn ? (
              <h3>轮到你了! 剩余时间: {remainingTime}s</h3>
            ) : (
              <h3>当前回合: {gameState.players[gameState.turn]?.name}</h3>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameUI;
