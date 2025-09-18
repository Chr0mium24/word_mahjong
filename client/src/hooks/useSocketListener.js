import { useEffect, useContext } from 'react';
import { SocketContext } from '../context/SocketContext';

const useSocketListener = (eventName, callback) => {
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (socket) {
      socket.on(eventName, callback);

      return () => {
        socket.off(eventName, callback);
      };
    }
  }, [socket, eventName, callback]);
};

export default useSocketListener;