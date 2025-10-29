import React from 'react';
import { GameState } from '@word-mahjong/common';

interface ScoreboardModalProps {
  gameState: GameState;
  onReadyForNextGame: () => void;
}

const ScoreboardModal: React.FC<ScoreboardModalProps> = ({ gameState, onReadyForNextGame }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>游戏结束</h2>
        <h3>得分榜</h3>
        <ul>
          {Object.values(gameState.players).map(player => (
            <li key={player.id}>
              {player.name}: {player.score}
            </li>
          ))}
        </ul>
        <button onClick={onReadyForNextGame}>准备下一局</button>
      </div>
      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .modal-content {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          text-align: center;
        }
      `}</style>
    </div>
  );
};

export default ScoreboardModal;
