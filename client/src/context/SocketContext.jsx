


import React, { createContext } from 'react';
import io from 'socket.io-client';

// 确保这里的URL指向您的Node.js服务器
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';
const socket = io(SOCKET_URL, {
    transports: ['websocket'],
});

export const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => {
    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};