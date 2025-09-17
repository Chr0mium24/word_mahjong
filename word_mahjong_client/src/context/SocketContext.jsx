import React, { createContext, useContext } from 'react';
import io from 'socket.io-client';

// 请将 'http://localhost:4000' 替换为您的后端服务器地址
const socket = io('http://localhost:4000');
const SocketContext = createContext(socket);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    );
};