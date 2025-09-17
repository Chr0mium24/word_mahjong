import React from 'react';
import { useGameState } from '../../context/GameStateContext';
import GameCanvas from '../canvas/GameCanvas';
import PlayerInfo from './PlayerInfo';
import ActionButtons from './ActionButtons';
import VoteModal from './VoteModal';

const GameUI = ({ playerId }) => {
    const gameState = useGameState();

    if (!gameState) {
        return <div className="flex items-center justify-center h-full">Loading Game...</div>;
    }

    return (
        <div className="relative w-full h-full flex flex-col">
            <header className="flex-shrink-0 bg-gray-900 p-2 shadow-md flex justify-between items-center">
                <h1 className="text-xl font-bold text-teal-400">Verse Weavers - Room: {gameState.roomId}</h1>
                <PlayerInfo players={gameState.players} currentPlayerId={playerId} turn={gameState.turn} />
            </header>

            <main className="flex-grow relative">
                <GameCanvas tiles={gameState.tiles} playerId={playerId} />
            </main>

            <footer className="flex-shrink-0 bg-gray-900 p-3 flex justify-center">
                <ActionButtons isMyTurn={gameState.turn === playerId} gameState={gameState.gameState} />
            </footer>

            {gameState.gameState === 'voting' && <VoteModal />}
        </div>
    );
};

export default GameUI;