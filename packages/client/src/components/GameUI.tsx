import React from 'react';
import { GameState, Player } from '@word-mahjong/common/types';

interface GameUIProps {
  gameState: GameState;
  currentPlayer: Player;
  onPlayTile: (tileId: string) => void;
}

const GameUI: React.FC<GameUIProps> = ({ gameState, currentPlayer, onPlayTile }) => {
  return (
    <div>
      <h1>房间: {gameState.roomId}</h1>
      <h2>玩家列表:</h2>
      <ul>
        {Object.values(gameState.players).map((p) => (
          <li key={p.id}>
            {p.name} {p.id === currentPlayer.id && '(你)'}
          </li>
        ))}
      </ul>

      {gameState.gameState === 'waiting' && (
        <div>
          <p>等待玩家加入... ({Object.keys(gameState.players).length}/4)</p>
          {Object.keys(gameState.players).length === 4 && <p>游戏即将开始!</p>}
        </div>
      )}

      {gameState.gameState === 'playing' && (
        <div>
          <h2>你的手牌:</h2>
          <div>
            {currentPlayer.hand.map((tile) => (
              <button key={tile.id} onDoubleClick={() => onPlayTile(tile.id)}>
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
          {gameState.turn === currentPlayer.id ? (
            <h3>轮到你了</h3>
          ) : (
            <h3>当前回合: {gameState.players[gameState.turn]?.name}</h3>
          )}
        </div>
      )}
    </div>
  );
};

export default GameUI;
