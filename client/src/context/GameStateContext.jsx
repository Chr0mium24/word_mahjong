import React, { createContext, useState, useContext } from 'react';

const GameStateContext = createContext();
const GameStateUpdateContext = createContext();

export const useGameState = () => {
    return useContext(GameStateContext);
};

export const useGameStateUpdate = () => {
    return useContext(GameStateUpdateContext);
};

export const GameStateProvider = ({ children }) => {
    const [gameState, setGameState] = useState(null);

    return (
        <GameStateContext.Provider value={gameState}>
            <GameStateUpdateContext.Provider value={setGameState}>
                {children}
            </GameStateUpdateContext.Provider>
        </GameStateContext.Provider>
    );
};