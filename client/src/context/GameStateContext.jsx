import React, { createContext, useState, useContext } from 'react';
import useSocketListener from '../hooks/useSocketListener';

export const GameStateContext = createContext();

export const GameStateProvider = ({ children }) => {
    const [gameState, setGameState] = useState(null);

    // 核心监听器：监听来自服务器的完整游戏状态更新
    useSocketListener('gameStateUpdate', (newGameState) => {
        console.log("Received gameStateUpdate: ", newGameState);
        setGameState(newGameState);
    });

    // 监听游戏结束
    useSocketListener('gameEnd', (endState) => {
        // 可以在这里处理游戏结束的逻辑，例如显示一个总结弹窗
        console.log("Game ended:", endState);
        // 示例：更新游戏状态以反映结束
        setGameState(prev => ({ ...prev, gameState: 'ended', gameResult: endState }));
    });

    return (
        <GameStateContext.Provider value={{ gameState, setGameState }}>
            {children}
        </GameStateContext.Provider>
    );
};